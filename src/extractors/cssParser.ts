import * as cheerio from 'cheerio';
import { ColorToken, TypographyToken, SpacingToken, ShadowToken, ShapeToken, DesignTokens } from './types';

interface ColorFrequency {
	[color: string]: number;
}

interface FontFrequency {
	[font: string]: number;
}

/**
 * Parse HTML and extract design tokens from CSSOM analysis
 */
export function extractDesignTokens(html: string): DesignTokens {
	const $ = cheerio.load(html);

	const colorFrequency: ColorFrequency = {};
	const fontFrequency: FontFrequency = {};
	const spacingFrequency: { [key: string]: number } = {};
	const shadowFrequency: { [key: string]: number } = {};
	const borderRadiusFrequency: { [key: string]: number } = {};

	// Extract colors from various sources
	extractColorsFromStyles($, colorFrequency);
	extractColorsFromHTML($, colorFrequency);

	// Extract typography
	extractTypography($, fontFrequency);

	// Extract spacing
	extractSpacing($, spacingFrequency);

	// Extract shadows
	extractShadows($, shadowFrequency);

	// Extract border radius
	extractBorderRadius($, borderRadiusFrequency);

	// Convert frequencies to tokens
	const colors = convertColorFrequencyToTokens(colorFrequency);
	const typography = convertFontFrequencyToTokens(fontFrequency);
	const spacing = convertSpacingFrequencyToTokens(spacingFrequency);
	const elevation = convertShadowFrequencyToTokens(shadowFrequency);
	const shapes = convertBorderRadiusFrequencyToTokens(borderRadiusFrequency);

	return {
		colors,
		typography,
		spacing,
		components: identifyComponents($),
		elevation,
		shapes
	};
}

function extractColorsFromStyles($: cheerio.CheerioAPI, colorFrequency: ColorFrequency): void {
	// Extract from inline styles
	$('[style]').each((_, element) => {
		const style = $(element).attr('style') || '';
		const colorMatches = style.match(/(#[0-9a-f]{6}|rgb\([^)]+\)|hsl\([^)]+\)|[a-z]+)/gi);
		if (colorMatches) {
			colorMatches.forEach(color => {
				const normalized = normalizeColor(color);
				if (normalized) {
					colorFrequency[normalized] = (colorFrequency[normalized] || 0) + 1;
				}
			});
		}
	});

	// Extract from <style> tags
	$('style').each((_, element) => {
		const styleContent = $(element).text();
		const colorMatches = styleContent.match(/(#[0-9a-f]{6}|rgb\([^)]+\)|hsl\([^)]+\)|rgba\([^)]+\))/gi);
		if (colorMatches) {
			colorMatches.forEach(color => {
				const normalized = normalizeColor(color);
				if (normalized) {
					colorFrequency[normalized] = (colorFrequency[normalized] || 0) + 1;
				}
			});
		}
	});
}

function extractColorsFromHTML($: cheerio.CheerioAPI, colorFrequency: ColorFrequency): void {
	// Extract from background colors
	$('[style*="background"]').each((_, element) => {
		const bg = $(element).css('background-color');
		if (bg) {
			const normalized = normalizeColor(bg);
			if (normalized) {
				colorFrequency[normalized] = (colorFrequency[normalized] || 0) + 1;
			}
		}
	});

	// Extract from text colors
	$('[style*="color"]').each((_, element) => {
		const color = $(element).css('color');
		if (color) {
			const normalized = normalizeColor(color);
			if (normalized) {
				colorFrequency[normalized] = (colorFrequency[normalized] || 0) + 1;
			}
		}
	});
}

function extractTypography($: cheerio.CheerioAPI, fontFrequency: FontFrequency): void {
	// Extract from link tags (font-family declarations)
	$('link[href*="fonts"]').each((_, element) => {
		const href = $(element).attr('href') || '';
		// Parse Google Fonts URLs, etc.
		if (href.includes('fonts.googleapis.com')) {
			const fontParams = new URL(href, 'https://fonts.googleapis.com').searchParams.get('family');
			if (fontParams) {
				const fonts = fontParams.split('|').map(f => f.split(':')[0]);
				fonts.forEach(font => {
					fontFrequency[font] = (fontFrequency[font] || 0) + 1;
				});
			}
		}
	});

	// Extract from elements with font-family in style
	$('[style*="font-family"]').each((_, element) => {
		const style = $(element).attr('style') || '';
		const fontMatch = style.match(/font-family\s*:\s*([^;]+)/i);
		if (fontMatch) {
			const fontName = fontMatch[1].trim().replace(/['"]/g, '').split(',')[0].trim();
			fontFrequency[fontName] = (fontFrequency[fontName] || 0) + 1;
		}
	});

	// Extract from headings and common typography elements
	const typographyElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'body'];
	typographyElements.forEach(selector => {
		$(selector).each((_, element) => {
			const fontFamily = $(element).css('font-family');
			if (fontFamily) {
				const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
				fontFrequency[fontName] = (fontFrequency[fontName] || 0) + 1;
			}
		});
	});
}

function extractSpacing($: cheerio.CheerioAPI, spacingFrequency: { [key: string]: number }): void {
	const spacingProperties = ['padding', 'margin', 'gap'];

	spacingProperties.forEach(prop => {
		$(`[style*="${prop}"]`).each((_, element) => {
			const style = $(element).attr('style') || '';
			const regex = new RegExp(`${prop}[^:]*:\\s*([^;]+)`, 'gi');
			let match;
			while ((match = regex.exec(style)) !== null) {
				const value = match[1].trim();
				if (value.match(/^\d+px|\d+rem|\d+em|\d+%/)) {
					spacingFrequency[value] = (spacingFrequency[value] || 0) + 1;
				}
			}
		});
	});
}

function extractShadows($: cheerio.CheerioAPI, shadowFrequency: { [key: string]: number }): void {
	$('[style*="box-shadow"]').each((_, element) => {
		const style = $(element).attr('style') || '';
		const shadowMatch = style.match(/box-shadow\s*:\s*([^;]+)/i);
		if (shadowMatch) {
			const shadow = shadowMatch[1].trim();
			shadowFrequency[shadow] = (shadowFrequency[shadow] || 0) + 1;
		}
	});
}

function extractBorderRadius($: cheerio.CheerioAPI, radiusFrequency: { [key: string]: number }): void {
	$('[style*="border-radius"]').each((_, element) => {
		const style = $(element).attr('style') || '';
		const radiusMatch = style.match(/border-radius\s*:\s*([^;]+)/i);
		if (radiusMatch) {
			const radius = radiusMatch[1].trim();
			radiusFrequency[radius] = (radiusFrequency[radius] || 0) + 1;
		}
	});
}

function identifyComponents($: cheerio.CheerioAPI) {
	const components = [];

	// Identify buttons
	const buttons = $('button, a[role="button"], [class*="btn"]');
	if (buttons.length > 0) {
		components.push({
			name: 'Buttons',
			description: 'Interactive button elements',
			colors: [],
			typography: [],
			spacing: [],
			borderRadius: ''
		});
	}

	// Identify cards
	const cards = $('[class*="card"], [class*="Card"]');
	if (cards.length > 0) {
		components.push({
			name: 'Cards',
			description: 'Card/container components',
			colors: [],
			typography: [],
			spacing: [],
			borderRadius: ''
		});
	}

	// Identify inputs
	const inputs = $('input, textarea, select');
	if (inputs.length > 0) {
		components.push({
			name: 'Form Inputs',
			description: 'Form input elements',
			colors: [],
			typography: [],
			spacing: [],
			borderRadius: ''
		});
	}

	// Identify modals/dialogs
	const modals = $('[class*="modal"], [class*="dialog"], dialog');
	if (modals.length > 0) {
		components.push({
			name: 'Modals',
			description: 'Modal/dialog components',
			colors: [],
			typography: [],
			spacing: [],
			borderRadius: ''
		});
	}

	return components;
}

function normalizeColor(color: string): string | null {
	const trimmed = color.trim().toLowerCase();

	// Validate hex
	if (/^#[0-9a-f]{6}$/.test(trimmed)) {
		return trimmed;
	}

	// Validate rgb/rgba
	if (/^rgba?\(/.test(trimmed)) {
		return trimmed;
	}

	// Validate hsl/hsla
	if (/^hsla?\(/.test(trimmed)) {
		return trimmed;
	}

	return null;
}

function convertColorFrequencyToTokens(colorFrequency: ColorFrequency): ColorToken[] {
	return Object.entries(colorFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20) // Top 20 colors
		.map(([color, frequency]) => ({
			value: color,
			frequency
		}));
}

function convertFontFrequencyToTokens(fontFrequency: FontFrequency): TypographyToken[] {
	return Object.entries(fontFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([font, frequency]) => ({
			fontFamily: font,
			frequency
		}));
}

function convertSpacingFrequencyToTokens(spacingFrequency: { [key: string]: number }): SpacingToken[] {
	return Object.entries(spacingFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15)
		.map(([value, frequency]) => ({
			value,
			frequency
		}));
}

function convertShadowFrequencyToTokens(shadowFrequency: { [key: string]: number }): ShadowToken[] {
	return Object.entries(shadowFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([value, frequency]) => ({
			value,
			frequency
		}));
}

function convertBorderRadiusFrequencyToTokens(radiusFrequency: { [key: string]: number }): ShapeToken[] {
	return Object.entries(radiusFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([borderRadius, frequency]) => ({
			borderRadius,
			frequency
		}));
}
