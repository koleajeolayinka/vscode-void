import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Void active: Fast Launch Mode.');

    let isVoidActive = true; 
    let statusBarItem: vscode.StatusBarItem;

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'vscode-void.toggle';
    context.subscriptions.push(statusBarItem);

    const voidDecorationType = vscode.window.createTextEditorDecorationType({
        color: 'transparent',
        textDecoration: 'none; text-shadow: 0 0 10px rgba(100, 100, 100, 0.5);',
        cursor: 'pointer',
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    function updateStatusBar(editor: vscode.TextEditor | undefined) {
        if (!editor || !editor.document.fileName.includes('.env')) {
            statusBarItem.hide();
            return;
        }
        
        statusBarItem.text = isVoidActive ? '$(eye-closed) Void: On' : '$(eye) Void: Off';
        statusBarItem.backgroundColor = isVoidActive ? undefined : new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBarItem.show();
    }

    function decorate(editor: vscode.TextEditor) {
        if (!editor.document.fileName.includes('.env')) {
            return;
        }

        if (!isVoidActive) {
            editor.setDecorations(voidDecorationType, []);
            return;
        }

        const text = editor.document.getText();
        const regEx = /(^[A-Z0-9_]+)\s*=\s*(.*$)/gm;
        const secretsToHide: vscode.DecorationOptions[] = [];
        
        let match;
        while ((match = regEx.exec(text))) {
            const value = match[2];
            if (!value || value.length < 2 || value === 'true' || value === 'false') continue;

            const startPos = editor.document.positionAt(match.index + match[0].indexOf(value));
            const endPos = editor.document.positionAt(match.index + match[0].length);
            secretsToHide.push({ range: new vscode.Range(startPos, endPos) });
        }

        editor.setDecorations(voidDecorationType, secretsToHide);
    }

    function updateAllVisibleEditors() {
        vscode.window.visibleTextEditors.forEach(editor => {
            decorate(editor);
        });
        updateStatusBar(vscode.window.activeTextEditor);
    }


    updateAllVisibleEditors();

    vscode.window.onDidChangeActiveTextEditor(editor => {
        updateStatusBar(editor);
        if (editor) decorate(editor);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        vscode.window.visibleTextEditors.forEach(editor => {
            if (editor.document === event.document) {
                decorate(editor);
            }
        });
    }, null, context.subscriptions);

    const toggleCommand = vscode.commands.registerCommand('vscode-void.toggle', () => {
        isVoidActive = !isVoidActive;
        updateAllVisibleEditors();
    });
    context.subscriptions.push(toggleCommand);
}

export function deactivate() {}