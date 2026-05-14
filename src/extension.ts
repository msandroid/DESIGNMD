import * as vscode from 'vscode';
import { WebviewManager } from './webview-manager';

let webviewManager: WebviewManager;

export function activate(context: vscode.ExtensionContext) {
	console.log('Design Extractor extension activated');

	// Initialize webview manager
	webviewManager = new WebviewManager(context);

	let disposable = vscode.commands.registerCommand('design-extractor.extract', async () => {
		const url = await vscode.window.showInputBox({
			placeHolder: 'https://example.com',
			prompt: 'Enter the URL of the website to extract design system from',
			validateInput: (value) => {
				if (!value) return 'URL is required';
				try {
					new URL(value);
					return '';
				} catch {
					return 'Invalid URL format';
				}
			}
		});

		if (!url) {
			return;
		}

		try {
			await webviewManager.show(url);
		} catch (error) {
			vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('Design Extractor extension deactivated');
}
