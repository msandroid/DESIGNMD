import { DesignTokens } from '../extractors/types';

/**
 * Format design tokens as Tailwind v4 @theme block
 */
export function formatAsTailwind(tokens: DesignTokens): string {
	const colors = formatTailwindColors(tokens);
	const fonts = formatTailwindFonts(tokens);
	const spacing = formatTailwindSpacing(tokens);
	const borderRadius = formatTailwindBorderRadius(tokens);

	return `@theme {
${colors}

${fonts}

${spacing}

${borderRadius}
}`;
}

function formatTailwindColors(tokens: DesignTokens): string {
	const colorLines = tokens.colors.slice(0, 15).map((color, i) => {
		const name = mapColorToTailwindName(i, color.usage);
		return `  --color-${name}: ${color.value};`;
	}).join('\n');

	return `/* Colors */
${colorLines}`;
}

function formatTailwindFonts(tokens: DesignTokens): string {
	const fontLines = tokens.typography.slice(0, 5).map((typo, i) => {
		return `  --font-${i === 0 ? 'serif' : 'sans'}-${i}: ${typo.fontFamily};`;
	}).join('\n');

	return `/* Typography */
${fontLines}`;
}

function formatTailwindSpacing(tokens: DesignTokens): string {
	const spacingLines = tokens.spacing.slice(0, 10).map((space, i) => {
		const name = mapSpacingToTailwindName(i);
		return `  --spacing-${name}: ${space.value};`;
	}).join('\n');

	return `/* Spacing */
${spacingLines}`;
}

function formatTailwindBorderRadius(tokens: DesignTokens): string {
	if (!tokens.shapes || tokens.shapes.length === 0) {
		return `/* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;`;
	}

	const radiusLines = tokens.shapes.slice(0, 5).map((shape, i) => {
		const name = ['none', 'sm', 'md', 'lg', 'full'][i] || `level${i}`;
		return `  --radius-${name}: ${shape.borderRadius};`;
	}).join('\n');

	return `/* Border Radius */
${radiusLines}`;
}

function mapColorToTailwindName(index: number, usage?: string): string {
	const names = [
		'primary',
		'secondary',
		'accent',
		'background',
		'foreground',
		'muted',
		'border',
		'input',
		'ring',
		'success',
		'warning',
		'error',
		'info',
		'subtle',
		'emphasis'
	];
	return names[index] || `custom${index}`;
}

function mapSpacingToTailwindName(index: number): string {
	const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
	return names[index] || `space${index}`;
}
