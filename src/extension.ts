import * as vscode from 'vscode';

// --- Global State ---
let statusBarItem: vscode.StatusBarItem;
let isEnabled = true;

// The Vault: Stores the real secret values in memory mapped to a random ID
const secretVault = new Map<string, string>();

// The Visual Style: Frosted Glass Blur
// Note: We use 'textDecoration' to inject the text-shadow CSS because VS Code
// doesn't support 'textShadow' as a direct property.
const blurDecorationType = vscode.window.createTextEditorDecorationType({
	color: 'transparent',
	cursor: 'pointer',
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
	textDecoration: 'none; text-shadow: 0 0 8px rgba(0,0,0,0.5); position: relative;' 
});

// --- Default Patterns (The "Zero Config" logic) ---
const DEFAULT_PATTERNS = [
	// Generic Keys (API_KEY, SECRET_KEY, etc.)
	/(?<=(_KEY|_TOKEN|_SECRET)=)[^\s"']+/gi,
	/(?<=("password"|"passwd"|"secret"|"token"|"api[_-]key")\s*:\s*")[^"]+/gi,
	/(?<=("password"|"passwd"|"secret"|"token"|"api[_-]key")\s*:\s*')[^']+/gi,
	
	// Specific Providers
	/sk_live_[0-9a-zA-Z]+/g,          // Stripe
	/xox[baprs]-([0-9a-zA-Z]{10,48})/g, // Slack
	/gh[pousr]_[A-Za-z0-9_]{30,255}/g,  // GitHub
	/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g // JWT (Generic)
];

// --- Helper: Get All Patterns (Default + Custom) ---
function getAllPatterns(): RegExp[] {
	const config = vscode.workspace.getConfiguration('void');
	const customStrings: string[] = config.get('customPatterns') || [];
	const customRegexes: RegExp[] = [];

	customStrings.forEach(patternStr => {
		try {
			// Users might type invalid regex, so we wrap in try/catch
			customRegexes.push(new RegExp(patternStr, 'g'));
		} catch (e) {
			console.warn(`[Void] Invalid custom pattern ignored: ${patternStr}`);
		}
	});

	return [...DEFAULT_PATTERNS, ...customRegexes];
}

// --- Helper: Check if file should be scanned ---
function shouldScanFile(document: vscode.TextDocument): boolean {
	const config = vscode.workspace.getConfiguration('void');
	const allowedPatterns: string[] = config.get('filesToScan') || ['**/.env*', '**/*.json', '**/*.yaml', '**/*.yml'];
	
	// Check against the glob patterns
	return allowedPatterns.some(pattern => 
		vscode.languages.match({ pattern: pattern, scheme: 'file' }, document) > 0
	);
}

// --- Core Logic: Scan and Blur ---
function updateDecorations(activeEditor: vscode.TextEditor) {
	if (!activeEditor || !isEnabled) {
		if (activeEditor) {
			activeEditor.setDecorations(blurDecorationType, []);
		}
		return;
	}

	const doc = activeEditor.document;

	// Optimization: Skip large files or unsupported files
	if (doc.lineCount > 5000 || !shouldScanFile(doc)) {
		return;
	}

	const config = vscode.workspace.getConfiguration('void');
	const blurMode = config.get('blurMode') || 'all'; // Default to 'all' if undefined
	const secretsToBlur: vscode.DecorationOptions[] = [];

	// --- MODE 1: Blur Everything ---
	if (blurMode === 'all') {
		// Iterate through every line and blur it if it has text
		for (let i = 0; i < doc.lineCount; i++) {
			const line = doc.lineAt(i);
			if (!line.isEmptyOrWhitespace) {
				secretsToBlur.push({
					range: line.range,
					hoverMessage: new vscode.MarkdownString('**🔒 Void:** Content Hidden (Blur All Mode)')
				});
			}
		}
		activeEditor.setDecorations(blurDecorationType, secretsToBlur);
		return; // Stop here, no need to scan for regex
	}

	// --- MODE 2: Blur Secrets Only ---
	const text = doc.getText();
	const patterns = getAllPatterns();

	for (const regex of patterns) {
		let match;
		while ((match = regex.exec(text))) {
			const startPos = doc.positionAt(match.index);
			const endPos = doc.positionAt(match.index + match[0].length);
			const range = new vscode.Range(startPos, endPos);
			
			// Generate a unique ID for this secret
			const secretId = `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			secretVault.set(secretId, match[0]);

			// Create the decoration with the secret ID attached
			const decoration: vscode.DecorationOptions = {
				range,
				hoverMessage: new vscode.MarkdownString(`**🔒 Void:** Secret Hidden\n\n[$(clippy) Copy to Clipboard](command:void.copySecret?${JSON.stringify(secretId)})`)
			};

			// Allow executing commands in Markdown
			(decoration.hoverMessage as vscode.MarkdownString).isTrusted = true;

			secretsToBlur.push(decoration);
		}
	}

	activeEditor.setDecorations(blurDecorationType, secretsToBlur);
}

// --- Main Activation ---
export function activate(context: vscode.ExtensionContext) {
	console.log('Void is active.');

	// 1. Register the Status Bar Item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'void.toggle';
	context.subscriptions.push(statusBarItem);
	updateStatusBar();

	// 2. Register Toggle Command
	const toggleCommand = vscode.commands.registerCommand('void.toggle', () => {
		isEnabled = !isEnabled;
		updateStatusBar();
		
		// Trigger update for all visible editors
		vscode.window.visibleTextEditors.forEach(editor => updateDecorations(editor));
		
		vscode.window.showInformationMessage(
			isEnabled ? 'Void: Privacy Mode ON' : 'Void: Privacy Mode OFF'
		);
	});
	context.subscriptions.push(toggleCommand);

	// 3. Register Copy Command (Safe Vault Access)
	const copyCommand = vscode.commands.registerCommand('void.copySecret', async (secretId: string) => {
		const realSecret = secretVault.get(secretId);
		if (realSecret) {
			await vscode.env.clipboard.writeText(realSecret);
			vscode.window.setStatusBarMessage('$(check) Secret copied to clipboard!', 3000);
		} else {
			vscode.window.showErrorMessage('Expired or invalid secret token.');
		}
	});
	context.subscriptions.push(copyCommand);

	// 4. Event Listeners
	let timeout: NodeJS.Timeout | undefined = undefined;
	const triggerUpdate = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(() => {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				updateDecorations(activeEditor);
			}
		}, 200); // 200ms debounce
	};

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			updateDecorations(editor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdate();
		}
	}, null, context.subscriptions);

	// Listen for configuration changes
	vscode.workspace.onDidChangeConfiguration(event => {
		if (
			event.affectsConfiguration('void.customPatterns') || 
			event.affectsConfiguration('void.filesToScan') ||
			event.affectsConfiguration('void.blurMode')
		) {
			vscode.window.visibleTextEditors.forEach(updateDecorations);
		}
	}, null, context.subscriptions);

	// Initial Run
	if (vscode.window.activeTextEditor) {
		updateDecorations(vscode.window.activeTextEditor);
	}
}

function updateStatusBar() {
	if (isEnabled) {
		statusBarItem.text = '$(eye-closed) Void: On';
		statusBarItem.tooltip = 'Click to disable screen blurring';
		statusBarItem.backgroundColor = undefined;
	} else {
		statusBarItem.text = '$(eye) Void: Off';
		statusBarItem.tooltip = 'Click to enable screen blurring';
		statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
	}
	statusBarItem.show();
}

export function deactivate() {
	secretVault.clear();
}