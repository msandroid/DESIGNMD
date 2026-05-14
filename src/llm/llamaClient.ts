import axios from 'axios';

export interface LlamaCompletionRequest {
	prompt: string;
	max_tokens?: number;
	temperature?: number;
	top_p?: number;
}

export interface LlamaCompletionResponse {
	content: string;
	stop_reason?: string;
	tokens_used?: number;
}

/**
 * Client for interacting with local llama.cpp server
 */
export class LlamaClient {
	private baseUrl: string;
	private timeout: number = 30000; // 30 second timeout for LLM responses

	constructor(baseUrl: string = 'http://localhost:8000') {
		this.baseUrl = baseUrl;
	}

	/**
	 * Check if llama.cpp server is accessible
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const response = await axios.get(`${this.baseUrl}/health`, {
				timeout: 5000
			});
			return response.status === 200;
		} catch {
			return false;
		}
	}

	/**
	 * Send a completion request to llama.cpp
	 */
	async complete(request: LlamaCompletionRequest): Promise<LlamaCompletionResponse> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/v1/completions`,
				{
					model: 'local-model', // llama.cpp uses a generic model identifier
					prompt: request.prompt,
					max_tokens: request.max_tokens || 1000,
					temperature: request.temperature ?? 0.7,
					top_p: request.top_p ?? 0.9,
					stream: false
				},
				{
					timeout: this.timeout,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			const choices = response.data.choices || [];
			if (choices.length === 0) {
				throw new Error('No completion returned from LLM');
			}

			const content = choices[0].text || choices[0].message?.content || '';
			return {
				content: content.trim(),
				stop_reason: choices[0].finish_reason,
				tokens_used: response.data.usage?.completion_tokens
			};
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.error?.message ||
					error.message ||
					'Unknown error';
				throw new Error(`LLM request failed: ${message}`);
			}
			throw new Error(`LLM connection error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Send a chat-style message (if server supports it)
	 */
	async chat(systemPrompt: string, userMessage: string): Promise<LlamaCompletionResponse> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/v1/chat/completions`,
				{
					model: 'local-model',
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userMessage }
					],
					max_tokens: 1500,
					temperature: 0.7,
					stream: false
				},
				{
					timeout: this.timeout,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			const choices = response.data.choices || [];
			if (choices.length === 0) {
				throw new Error('No completion returned from LLM');
			}

			const content = choices[0].message?.content || '';
			return {
				content: content.trim(),
				stop_reason: choices[0].finish_reason,
				tokens_used: response.data.usage?.completion_tokens
			};
		} catch (error) {
			// Fallback to completion endpoint if chat is not supported
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				const prompt = `${systemPrompt}\n\n${userMessage}`;
				return this.complete({ prompt, max_tokens: 1500 });
			}

			if (axios.isAxiosError(error)) {
				throw new Error(`LLM request failed: ${error.message}`);
			}
			throw new Error(`LLM connection error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Generate text with a fallback if LLM is unavailable
	 */
	async generateWithFallback(prompt: string): Promise<string> {
		try {
			const response = await this.complete({
				prompt,
				max_tokens: 1000,
				temperature: 0.7
			});
			return response.content;
		} catch (error) {
			// Return a template response if LLM is unavailable
			console.error(`LLM generation failed: ${error instanceof Error ? error.message : String(error)}`);
			return `# Design System\n\nThis design system was generated from the extracted tokens. Customize this section based on the token analysis above.\n\n${generateFallbackDescription(prompt)}`;
		}
	}
}

function generateFallbackDescription(prompt: string): string {
	// Extract information from the prompt to provide a basic description
	if (prompt.includes('philosophy')) {
		return 'Clean, modern design system focused on clarity and usability.';
	}
	if (prompt.includes('guidance')) {
		return 'Use consistent spacing and typography across all components for cohesion.';
	}
	if (prompt.includes('Do:')) {
		return 'Do: Maintain consistent spacing | Do: Use core colors | Do: Follow typography scale\n\nDon\'t: Mix colors arbitrarily | Don\'t: Add unlisted fonts | Don\'t: Break spacing rhythm';
	}
	return 'Design system extracted from website tokens.';
}
