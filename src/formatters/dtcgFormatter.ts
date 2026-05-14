import { DesignTokens } from '../extractors/types';

/**
 * Format design tokens as Design Token Community Group (DTCG) format
 * Reference: https://design-tokens.github.io/community-group/format/
 */
export function formatAsDTCG(tokens: DesignTokens): object {
	return {
		$schema: 'https://tokens.studio/schemas/json/tokens-schema-15.json',
		$version: '1.0.0',
		$comment: 'Extracted design system tokens',
		color: formatDTCGColors(tokens),
		typography: formatDTCGTypography(tokens),
		spacing: formatDTCGSpacing(tokens),
		shadow: formatDTCGShadows(tokens),
		borderRadius: formatDTCGBorderRadius(tokens)
	};
}

function formatDTCGColors(tokens: DesignTokens) {
	const result: { [key: string]: any } = {};

	// Group colors by type
	const colorGroups = {
		primary: tokens.colors.slice(0, 3),
		secondary: tokens.colors.slice(3, 6),
		neutral: tokens.colors.slice(6, 12),
		semantic: tokens.colors.slice(12, 15)
	};

	Object.entries(colorGroups).forEach(([groupName, colors]) => {
		if (colors.length > 0) {
			result[groupName] = {};
			colors.forEach((color, i) => {
				result[groupName][i === 0 ? 'base' : `level${i}`] = {
					$value: color.value,
					$type: 'color',
					$description: `Color ${i + 1} from ${groupName} group`
				};
			});
		}
	});

	return result;
}

function formatDTCGTypography(tokens: DesignTokens) {
	const result: { [key: string]: any } = {};

	tokens.typography.slice(0, 5).forEach((typo, i) => {
		const fontKey = i === 0 ? 'primary' : `secondary${i}`;
		result[fontKey] = {
			$value: typo.fontFamily,
			$type: 'fontFamily',
			$description: `Typography font ${i + 1}`
		};

		if (typo.fontSize) {
			result[`${fontKey}-size`] = {
				$value: typo.fontSize,
				$type: 'dimension',
				$description: `Font size for ${fontKey}`
			};
		}

		if (typo.fontWeight) {
			result[`${fontKey}-weight`] = {
				$value: typo.fontWeight,
				$type: 'number',
				$description: `Font weight for ${fontKey}`
			};
		}
	});

	return result;
}

function formatDTCGSpacing(tokens: DesignTokens) {
	const result: { [key: string]: any } = {};

	const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
	tokens.spacing.slice(0, 10).forEach((space, i) => {
		const sizeKey = sizes[i] || `size${i}`;
		result[sizeKey] = {
			$value: space.value,
			$type: 'dimension',
			$description: `Spacing scale ${sizeKey}`
		};
	});

	return result;
}

function formatDTCGShadows(tokens: DesignTokens) {
	if (!tokens.elevation || tokens.elevation.length === 0) {
		return {};
	}

	const result: { [key: string]: any } = {};
	const shadowNames = ['xs', 'sm', 'md', 'lg', 'xl'];

	tokens.elevation.slice(0, 5).forEach((shadow, i) => {
		const name = shadowNames[i] || `shadow${i}`;
		result[name] = {
			$value: shadow.value,
			$type: 'shadow',
			$description: `Shadow level ${i + 1}`
		};
	});

	return result;
}

function formatDTCGBorderRadius(tokens: DesignTokens) {
	const result: { [key: string]: any } = {};

	if (!tokens.shapes || tokens.shapes.length === 0) {
		// Default radii
		const defaults = [
			{ key: 'none', value: '0' },
			{ key: 'sm', value: '4px' },
			{ key: 'md', value: '8px' },
			{ key: 'lg', value: '12px' },
			{ key: 'full', value: '9999px' }
		];

		defaults.forEach(({ key, value }) => {
			result[key] = {
				$value: value,
				$type: 'dimension',
				$description: `Border radius ${key}`
			};
		});
	} else {
		const radiusNames = ['none', 'sm', 'md', 'lg', 'full'];
		tokens.shapes.slice(0, 5).forEach((shape, i) => {
			const name = radiusNames[i] || `radius${i}`;
			result[name] = {
				$value: shape.borderRadius,
				$type: 'dimension',
				$description: `Border radius ${name}`
			};
		});
	}

	return result;
}
