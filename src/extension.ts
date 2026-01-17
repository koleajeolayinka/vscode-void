import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let isEnabled = true;

const secretVault = new Map<string, string>();

const blurDecorationType = vscode.window.createTextEditorDecorationType({
    color: 'transparent',
    cursor: 'pointer',
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    textDecoration: 'none; text-shadow: 0 0 8px rgba(0,0,0,0.5); position: relative;'
});

const DEFAULT_PATTERNS = [
    /(?<=(_KEY|_TOKEN|_SECRET|_PASSWORD|_PASS|_PWD|_URL|_ID|_USER|_AUTH|_Dn|_String)=)[^\s"']+/gi,
    /(?<=("password"|"passwd"|"secret"|"token"|"api[_-]key")\s*:\s*")[^"]+/gi,
    /(?<=("password"|"passwd"|"secret"|"token"|"api[_-]key")\s*:\s*')[^']+/gi,
    /sk_live_[0-9a-zA-Z]+/g,
    /xox[baprs]-([0-9a-zA-Z]{10,48})/g,
    /gh[pousr]_[A-Za-z0-9_]{30,255}/g,
    /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g
];

function getAllPatterns(): RegExp[] {
    const config = vscode.workspace.getConfiguration('void');
    const customStrings: string[] = config.get('customPatterns') || [];
    const customRegexes: RegExp[] = [];

    customStrings.forEach(patternStr => {
        try {
            customRegexes.push(new RegExp(patternStr, 'g'));
        } catch (e) {
            console.warn(`[Void] Invalid custom pattern ignored: ${patternStr}`);
        }
    });

    return [...DEFAULT_PATTERNS, ...customRegexes];
}

function shouldScanFile(document: vscode.TextDocument): boolean {
    const config = vscode.workspace.getConfiguration('void');
    const excludedPatterns: string[] = config.get('excludedFiles') || [];
    const isExcluded = excludedPatterns.some(pattern =>
        vscode.languages.match({ pattern: pattern, scheme: 'file' }, document) > 0
    );

    if (isExcluded) {
        return false;
    }
    return true;
}

function updateDecorations(activeEditor: vscode.TextEditor) {
    if (!activeEditor || !isEnabled) {
        if (activeEditor) {
            activeEditor.setDecorations(blurDecorationType, []);
        }
        return;
    }

    const doc = activeEditor.document;

    if (doc.lineCount > 5000 || !shouldScanFile(doc)) {
        activeEditor.setDecorations(blurDecorationType, []);
        return;
    }

    const config = vscode.workspace.getConfiguration('void');
    const blurMode = config.get('blurMode') || 'secrets';

    if (blurMode === 'all') {
        const secretsToBlur: vscode.DecorationOptions[] = [];
        for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i);
            if (!line.isEmptyOrWhitespace) {
                secretsToBlur.push({
                    range: line.range,
                    hoverMessage: new vscode.MarkdownString('**🔒 Void:** Content Hidden')
                });
            }
        }
        activeEditor.setDecorations(blurDecorationType, secretsToBlur);
        return;
    }

    const text = doc.getText();
    const patterns = getAllPatterns();
    const decorationRanges: vscode.Range[] = [];
    const finalDecorations: vscode.DecorationOptions[] = [];

    for (const regex of patterns) {
        let match;
        regex.lastIndex = 0;

        while ((match = regex.exec(text))) {
            const startPos = doc.positionAt(match.index);
            const endPos = doc.positionAt(match.index + match[0].length);
            const newRange = new vscode.Range(startPos, endPos);

            const isOverlapping = decorationRanges.some(existingRange =>
                existingRange.intersection(newRange) !== undefined
            );

            if (isOverlapping) {
                continue;
            }

            decorationRanges.push(newRange);

            const secretId = `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            secretVault.set(secretId, match[0]);

            const hoverMessage = new vscode.MarkdownString(
                `**🔒 Void:** Secret Hidden\n\n[$(copy) Copy](command:void.copySecret?${JSON.stringify(secretId)})`
            );
            hoverMessage.isTrusted = true;
            hoverMessage.supportThemeIcons = true;

            finalDecorations.push({
                range: newRange,
                hoverMessage: hoverMessage
            });
        }
    }

    activeEditor.setDecorations(blurDecorationType, finalDecorations);
}

export function activate(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'void.toggle';
    context.subscriptions.push(statusBarItem);
    updateStatusBar();

    const toggleCommand = vscode.commands.registerCommand('void.toggle', () => {
        isEnabled = !isEnabled;
        updateStatusBar();
        vscode.window.visibleTextEditors.forEach(editor => updateDecorations(editor));
        vscode.window.showInformationMessage(
            isEnabled ? 'Void: Privacy Mode ON' : 'Void: Privacy Mode OFF'
        );
    });
    context.subscriptions.push(toggleCommand);

    const copyCommand = vscode.commands.registerCommand('void.copySecret', async (secretId: string) => {
        const realSecret = secretVault.get(secretId);
        if (realSecret) {
            await vscode.env.clipboard.writeText(realSecret);
            vscode.window.setStatusBarMessage('$(check) Copied to clipboard', 2000);
        } else {
            vscode.window.showErrorMessage('Expired or invalid secret token.');
        }
    });
    context.subscriptions.push(copyCommand);

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
        }, 200);
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

    vscode.workspace.onDidChangeConfiguration(event => {
        if (
            event.affectsConfiguration('void.customPatterns') ||
            event.affectsConfiguration('void.filesToScan') ||
            event.affectsConfiguration('void.excludedFiles') ||
            event.affectsConfiguration('void.blurMode')
        ) {
            vscode.window.visibleTextEditors.forEach(updateDecorations);
        }
    }, null, context.subscriptions);

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