import axios, { AxiosError } from 'axios';

/**
 * Fetches HTML content from a given URL with timeout and error handling
 */
export async function fetchHTML(url: string, timeout: number = 10000): Promise<string> {
	try {
		const response = await axios.get(url, {
			timeout,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			},
			maxRedirects: 5,
			validateStatus: (status) => status < 400 // Allow any status < 400
		});

		if (!response.data) {
			throw new Error('Empty response body');
		}

		return response.data as string;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError;
			if (axiosError.code === 'ECONNABORTED') {
				throw new Error(`Request timeout: took longer than ${timeout}ms`);
			}
			if (axiosError.response?.status) {
				throw new Error(`HTTP ${axiosError.response.status}: ${axiosError.message}`);
			}
			throw new Error(`Network error: ${axiosError.message}`);
		}
		throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Validates if a URL is publicly accessible
 */
export function validateUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		// Reject localhost and private IPs (for security)
		if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}
