import * as vscode from 'vscode';
import * as path from 'path';
import { fetchHTML, validateUrl } from './extractors/htmlFetcher';
import { extractDesignTokens } from './extractors/cssParser';
import { LlamaClient } from './llm/llamaClient';
import { DESIGN_PHILOSOPHY_PROMPT, COMPONENT_GUIDANCE_PROMPT, DOS_AND_DONTS_PROMPT } from './llm/prompts';
import { formatAsDesignMd } from './formatters/designMdFormatter';
import { formatAsTailwind } from './formatters/tailwindFormatter';
import { formatAsCSSVariables } from './formatters/cssVarFormatter';
import { formatAsDTCG } from './formatters/dtcgFormatter';
import { DesignTokens } from './extractors/types';

export class WebviewManager {
	private panel: vscode.WebviewPanel | undefined;
	private extensionContext: vscode.ExtensionContext;
	private llamaClient: LlamaClient;

	constructor(context: vscode.ExtensionContext, llamaBaseUrl: string = 'http://localhost:8000') {
		this.extensionContext = context;
		this.llamaClient = new LlamaClient(llamaBaseUrl);
	}

	public async show(url: string): Promise<void> {
		if (this.panel) {
			this.panel.reveal(vscode.ViewColumn.One);
		} else {
			this.panel = vscode.window.createWebviewPanel(
				'designExtractor',
				'Design Extractor',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					localResourceRoots: [
						vscode.Uri.file(path.join(this.extensionContext.extensionPath, 'src', 'webview'))
					]
				}
			);

			this.panel.webview.html = this.getWebviewContent();
			this.panel.onDidDispose(() => {
				this.panel = undefined;
			});

			// Handle messages from webview
			this.panel.webview.onDidReceiveMessage(async (message) => {
				if (message.command === 'extract') {
					await this.handleExtraction(message.url);
				}
			});
		}

		// Start extraction
		if (this.panel) {
			this.panel.webview.postMessage({
				command: 'extractProgress',
				message: 'Starting extraction...'
			});
			await this.handleExtraction(url);
		}
	}

	private async handleExtraction(url: string): Promise<void> {
		try {
			if (!validateUrl(url)) {
				throw new Error('Invalid URL format');
			}

			// Fetch HTML
			this.sendProgress('Fetching website...');
			const html = await fetchHTML(url, 15000);

			// Extract tokens
			this.sendProgress('Analyzing design tokens...');
			const tokens = extractDesignTokens(html);

			// Check if LLM is available
			this.sendProgress('Connecting to LLM...');
			const llmAvailable = await this.llamaClient.healthCheck();

			let designPhilosophy = '';
			let componentGuidance = '';
			let dosAndDonts = '';

			if (llmAvailable) {
				// Generate design philosophy
				this.sendProgress('Generating design philosophy...');
				designPhilosophy = await this.generatePhilosophy(tokens);

				// Generate component guidance
				this.sendProgress('Generating component guidance...');
				componentGuidance = await this.generateComponentGuidance(tokens);

				// Generate do's and don'ts
				this.sendProgress('Generating do\'s and don\'ts...');
				dosAndDonts = await this.generateDosAndDonts(tokens);
			} else {
				vscode.window.showWarningMessage(
					'LLM server not available at http://localhost:8000. Design prose will be generated from templates.'
				);
			}

			// Format outputs
			this.sendProgress('Formatting outputs...');
			const outputs = {
				designMd: formatAsDesignMd(tokens, designPhilosophy, componentGuidance, dosAndDonts),
				tailwind: formatAsTailwind(tokens),
				cssVars: formatAsCSSVariables(tokens),
				dtcg: formatAsDTCG(tokens)
			};

			// Send results to webview
			if (this.panel) {
				this.panel.webview.postMessage({
					command: 'extractComplete',
					results: outputs
				});
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.sendError(errorMessage);
		}
	}

	private async generatePhilosophy(tokens: DesignTokens): Promise<string> {
		const colors = tokens.colors
			.slice(0, 5)
			.map(c => c.value)
			.join(', ');
		const fonts = tokens.typography
			.slice(0, 3)
			.map(t => t.fontFamily)
			.join(', ');
		const spacing = tokens.spacing
			.slice(0, 3)
			.map(s => s.value)
			.join(', ');

		const prompt = DESIGN_PHILOSOPHY_PROMPT
			.replace('{colors}', colors)
			.replace('{fonts}', fonts)
			.replace('{spacing}', spacing)
			.replace('{components}', tokens.components.map(c => c.name).join(', '));

		try {
			return await this.llamaClient.generateWithFallback(prompt);
		} catch {
			return 'Clean, modern design system focused on clarity and usability.';
		}
	}

	private async generateComponentGuidance(tokens: DesignTokens): Promise<string> {
		const colors = tokens.colors
			.slice(0, 3)
			.map(c => c.value)
			.join(', ');
		const fonts = tokens.typography
			.slice(0, 2)
			.map(t => t.fontFamily)
			.join(', ');
		const spacing = tokens.spacing
			.slice(0, 2)
			.map(s => s.value)
			.join(', ');

		const prompt = COMPONENT_GUIDANCE_PROMPT
			.replace('{colors}', colors)
			.replace('{fonts}', fonts)
			.replace('{spacing}', spacing);

		try {
			return await this.llamaClient.generateWithFallback(prompt);
		} catch {
			return 'Use consistent spacing and typography across all components.';
		}
	}

	private async generateDosAndDonts(tokens: DesignTokens): Promise<string> {
		const colors = tokens.colors
			.slice(0, 3)
			.map(c => c.value)
			.join(', ');
		const fonts = tokens.typography
			.slice(0, 2)
			.map(t => t.fontFamily)
			.join(', ');
		const spacing = tokens.spacing
			.slice(0, 2)
			.map(s => s.value)
			.join(', ');

		const prompt = DOS_AND_DONTS_PROMPT
			.replace('{colors}', colors)
			.replace('{fonts}', fonts)
			.replace('{spacing}', spacing);

		try {
			return await this.llamaClient.generateWithFallback(prompt);
		} catch {
			return `Do:
- Use core colors consistently
- Maintain spacing rhythm
- Follow typography scale

Don't:
- Mix colors arbitrarily
- Add unlisted fonts
- Break spacing consistency`;
		}
	}

	private sendProgress(message: string): void {
		if (this.panel) {
			this.panel.webview.postMessage({
				command: 'extractProgress',
				message
			});
		}
	}

	private sendError(error: string): void {
		if (this.panel) {
			this.panel.webview.postMessage({
				command: 'extractError',
				error
			});
		}
	}

	private getWebviewContent(): string {
		const webviewPath = path.join(this.extensionContext.extensionPath, 'src', 'webview', 'main.html');
		const fs = require('fs');
		return fs.readFileSync(webviewPath, 'utf-8');
	}
}
