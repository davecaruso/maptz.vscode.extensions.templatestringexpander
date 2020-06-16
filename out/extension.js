'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "string-template-expander" is now active!');
    const languageIds = {
        javascript: ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']
    };
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('templateStringExpander.convertToTemplateString', () => {
        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        var ate = vscode.window.activeTextEditor;
        if (!ate)
            return;
        else if (languageIds.javascript.includes(ate.document.languageId)) {
            convertJavascriptStringToTemplate(ate).catch(err => {
                throw err;
            });
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
const quoteEscReg = {
    "'": /\\(')/g,
    '"': /\\(")/g,
};
function convertJavascriptStringToTemplate(textEditor) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentLine = textEditor.document.lineAt(textEditor.selection.start.line).text;
        let cursorI = textEditor.selection.start.character;
        function scan(quote) {
            let i, o;
            let found = 0;
            for (i = cursorI; i > 0; i--) {
                if (currentLine[i - 1] !== '\\' && currentLine[i] === quote) {
                    found++;
                    break;
                }
            }
            for (o = cursorI; o < currentLine.length; o++) {
                if (currentLine[o - 1] !== '\\' && currentLine[o] === quote) {
                    found++;
                    break;
                }
            }
            if (found === 2) {
                return [i, o, quote, o - i];
            }
            else {
                return [0, 0, quote, 0];
            }
        }
        const doubleQuoteScan = scan('"');
        const singleQuoteScan = scan("'");
        const [i, o, quoteType, len] = (doubleQuoteScan[3] > singleQuoteScan[3]) ? doubleQuoteScan : singleQuoteScan;
        if (len !== 0) {
            console.log(i, o);
            let isJSXAttribute = currentLine[i - 1] === '='
                && (!(currentLine.slice(0, i).includes('const')
                    || currentLine.slice(0, i).includes('const')
                    || currentLine.slice(0, i).includes('var')
                    || currentLine.slice(0, i).includes('let'))
                    || (currentLine.slice(0, i).match(/[(=] *</)));
            textEditor.edit(editor => {
                var firstCharRange = new vscode.Range(new vscode.Position(textEditor.selection.start.line, i), new vscode.Position(textEditor.selection.start.line, i + 1));
                var lastCharRange = new vscode.Range(new vscode.Position(textEditor.selection.start.line, o), new vscode.Position(textEditor.selection.start.line, o + 1));
                var innerCharRange = new vscode.Range(new vscode.Position(textEditor.selection.start.line, i + 1), new vscode.Position(textEditor.selection.start.line, o - 1));
                editor.replace(firstCharRange, isJSXAttribute ? "{`" : "`");
                editor.replace(lastCharRange, isJSXAttribute ? "`}" : "`");
                editor.replace(innerCharRange, currentLine
                    .slice(i + 1, o - 1)
                    .replace(quoteEscReg[quoteType], '$1')
                    .replace(/(\\+)`/g, (_, slashes) => `${"\\".repeat(Math.floor(slashes.length / 2) * 2 + 1)}\``));
            });
        }
        console.log('done');
    });
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map