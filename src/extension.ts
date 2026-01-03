import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Void active: Secure Vault Mode.');

    let isVoidActive = true; 
    let statusBarItem: vscode.StatusBarItem;
    let filesToScan: string[] = ["**/*.env*"]; 
    
    const fileCheckCache = new WeakMap<vscode.TextDocument, boolean>();
    
    const secretVault = new Map<string, string>();

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'vscode-void.toggle';
    context.subscriptions.push(statusBarItem);

    const voidDecorationType = vscode.window.createTextEditorDecorationType({
        color: 'transparent',
        textDecoration: 'none; text-shadow: 0 0 10px rgba(100, 100, 100, 0.5);',
        cursor: 'pointer',
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    function refreshConfig() {
        const config = vscode.workspace.getConfiguration('void');
        filesToScan = config.get<string[]>('filesToScan') || [];
        updateAllVisibleEditors(); 
    }

    function shouldScanFile(document: vscode.TextDocument): boolean {
        if (fileCheckCache.has(document)) return fileCheckCache.get(document)!;
        let isMatch = false;
        for (const pattern of filesToScan) {
            if (vscode.languages.match({ pattern }, document) > 0) {
                isMatch = true;
                break;
            }
        }
        fileCheckCache.set(document, isMatch);
        return isMatch;
    }

    function decorate(editor: vscode.TextEditor) {
        if (!shouldScanFile(editor.document)) {
            editor.setDecorations(voidDecorationType, []); 
            return;
        }
        if (!isVoidActive) {
            editor.setDecorations(voidDecorationType, []);
            return;
        }

        const text = editor.document.getText();
        const regEx = /(["']?[\w-]+["']?)\s*[:=]\s*(.*)/gm;
        const secretsToHide: vscode.DecorationOptions[] = [];
        
        let match;
        while ((match = regEx.exec(text))) {
            let value = match[2]; 
            if (value.endsWith(',')) value = value.slice(0, -1);
            if (!value || value.length < 2 || value === 'true' || value === 'false') continue;

            const matchStart = match.index + match[0].indexOf(value);
            const startPos = editor.document.positionAt(matchStart);
            const endPos = editor.document.positionAt(matchStart + value.length);
            secretsToHide.push({ range: new vscode.Range(startPos, endPos) });
        }
        editor.setDecorations(voidDecorationType, secretsToHide);
    }

    vscode.languages.registerHoverProvider('*', {
        provideHover(document, position, token) {
            if (!shouldScanFile(document) || !isVoidActive) return;

            const range = document.getWordRangeAtPosition(position, /(["']?[\w-]+["']?)\s*[:=]\s*(.*)/);
            if (!range) return;

            const text = document.getText(range);
            const separator = text.includes('=') ? '=' : ':';
            const parts = text.split(separator);
            if (parts.length < 2) return;

            const rawValue = parts.slice(1).join(separator).trim();
            
            let cleanValue = rawValue;
            if (cleanValue.endsWith(',')) cleanValue = cleanValue.slice(0, -1);
            if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) || (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
                cleanValue = cleanValue.slice(1, -1);
            }


            const tokenId = `void_${Math.random().toString(36).substr(2, 9)}`;
            
            secretVault.set(tokenId, cleanValue);

            const args = encodeURIComponent(JSON.stringify([tokenId]));
            const commandUri = vscode.Uri.parse(`command:vscode-void.copySecret?${args}`);

            const md = new vscode.MarkdownString(`**Hidden Value** \n\n [Copy](${commandUri})`);
            md.isTrusted = true;
            
            return new vscode.Hover(md);
        }
    });

    const copyCommand = vscode.commands.registerCommand('vscode-void.copySecret', (tokenId: string) => {
        const secret = secretVault.get(tokenId);

        if (secret) {
            vscode.env.clipboard.writeText(secret);
            vscode.window.setStatusBarMessage('Secret copied', 2000); 
            
            secretVault.delete(tokenId);
        } else {
            vscode.window.setStatusBarMessage('Error: Token expired', 2000);
        }
    });
    context.subscriptions.push(copyCommand);

    function updateAllVisibleEditors() {
        vscode.window.visibleTextEditors.forEach(editor => decorate(editor));
        updateStatusBar(vscode.window.activeTextEditor);
    }

    function updateStatusBar(editor: vscode.TextEditor | undefined) {
        if (!editor || !shouldScanFile(editor.document)) {
            statusBarItem.hide();
            return;
        }
        statusBarItem.text = isVoidActive ? 'Void: On' : 'Void: Off';
        statusBarItem.show();
    }

    refreshConfig();
    
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('void.filesToScan')) refreshConfig();
    });

    vscode.window.onDidChangeActiveTextEditor(editor => {
        updateStatusBar(editor);
        if (editor) decorate(editor);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(e => {
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
            decorate(vscode.window.activeTextEditor);
        }
    }, null, context.subscriptions);

    context.subscriptions.push(vscode.commands.registerCommand('vscode-void.toggle', () => {
        isVoidActive = !isVoidActive;
        updateAllVisibleEditors();
    }));
}

export function deactivate() {}