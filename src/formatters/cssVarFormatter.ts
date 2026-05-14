import { DesignTokens } from '../extractors/types';

/**
 * Format design tokens as CSS custom properties (variables)
 */
export function formatAsCSSVariables(tokens: DesignTokens): string {
	const colors = formatCSSColors(tokens);
	const fonts = formatCSSFonts(tokens);
	const spacing = formatCSSSpacing(tokens);
	const shadows = formatCSSElevation(tokens);
	const borderRadius = formatCSSBorderRadius(tokens);

	return `:root {
${colors}

${fonts}

${spacing}

${shadows}

${borderRadius}
}`;
}

function formatCSSColors(tokens: DesignTokens): string {
	const lines = tokens.colors.slice(0, 15).map((color, i) => {
		const name = mapColorToVariableName(i, color.usage);
		return `  --color-${name}: ${color.value};`;
	});

	return lines.join('\n');
}

function formatCSSFonts(tokens: DesignTokens): string {
	const lines: string[] = [];

	tokens.typography.slice(0, 5).forEach((typo, i) => {
		const familyName = `--font-${i === 0 ? 'primary' : `secondary-${i}`}`;
		lines.push(`  ${familyName}: "${typo.fontFamily}", system-ui, sans-serif;`);

		if (typo.fontSize) {
			lines.push(`  ${familyName}-size: ${typo.fontSize};`);
		}
		if (typo.fontWeight) {
			lines.push(`  ${familyName}-weight: ${typo.fontWeight};`);
		}
		if (typo.lineHeight) {
			lines.push(`  ${familyName}-line-height: ${typo.lineHeight};`);
		}
	});

	return lines.join('\n');
}

function formatCSSSpacing(tokens: DesignTokens): string {
	const lines = tokens.spacing.slice(0, 10).map((space, i) => {
		const name = mapSpacingToVariableName(i);
		return `  --spacing-${name}: ${space.value};`;
	});

	return lines.join('\n');
}

function formatCSSElevation(tokens: DesignTokens): string {
	if (!tokens.elevation || tokens.elevation.length === 0) {
		return `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);`;
	}

	const lines = tokens.elevation.slice(0, 5).map((shadow, i) => {
		const names = ['xs', 'sm', 'md', 'lg', 'xl'];
		return `  --shadow-${names[i] || `level${i}`}: ${shadow.value};`;
	});

	return lines.join('\n');
}

function formatCSSBorderRadius(tokens: DesignTokens): string {
	if (!tokens.shapes || tokens.shapes.length === 0) {
		return `--radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;`;
	}

	const lines = tokens.shapes.slice(0, 5).map((shape, i) => {
		const names = ['none', 'sm', 'md', 'lg', 'full'];
		return `  --radius-${names[i] || `level${i}`}: ${shape.borderRadius};`;
	});

	return lines.join('\n');
}

function mapColorToVariableName(index: number, usage?: string): string {
	const names = [
		'primary',
		'secondary',
		'accent',
		'background',
		'text',
		'muted',
		'border',
		'surface',
		'info',
		'success',
		'warning',
		'error',
		'danger',
		'link',
		'visited'
	];
	return names[index] || `custom-${index}`;
}

function mapSpacingToVariableName(index: number): string {
	const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
	return names[index] || `level-${index}`;
}
