import { DesignTokens } from '../extractors/types';

/**
 * Format design tokens as DESIGN.md with YAML front matter
 */
export function formatAsDesignMd(
	tokens: DesignTokens,
	designPhilosophy: string = '',
	componentGuidance: string = '',
	dosAndDonts: string = ''
): string {
	const yamlFrontMatter = generateYAMLFrontMatter(tokens);
	const markdownBody = generateMarkdownBody(tokens, designPhilosophy, componentGuidance, dosAndDonts);

	return `${yamlFrontMatter}\n\n${markdownBody}`;
}

function generateYAMLFrontMatter(tokens: DesignTokens): string {
	const colorMap: { [key: string]: string } = {};
	tokens.colors.slice(0, 10).forEach((color, i) => {
		colorMap[`color${i + 1}`] = color.value;
	});

	const fontMap: { [key: string]: any } = {};
	tokens.typography.slice(0, 5).forEach((typo, i) => {
		fontMap[`font${i + 1}`] = {
			fontFamily: typo.fontFamily,
			...(typo.fontSize && { fontSize: typo.fontSize }),
			...(typo.fontWeight && { fontWeight: typo.fontWeight })
		};
	});

	const spacingMap: { [key: string]: string } = {};
	tokens.spacing.slice(0, 8).forEach((space, i) => {
		spacingMap[`space${i + 1}`] = space.value;
	});

	return `---
name: Extracted Design System
version: 1.0.0

colors:
${Object.entries(colorMap).map(([key, value]) => `  ${key}: "${value}"`).join('\n')}

typography:
${Object.entries(fontMap).map(([key, value]) => {
		const font = value as any;
		return `  ${key}:
    fontFamily: ${font.fontFamily}
${font.fontSize ? `    fontSize: "${font.fontSize}"` : ''}
${font.fontWeight ? `    fontWeight: ${font.fontWeight}` : ''}`;
	}).join('\n')}

spacing:
${Object.entries(spacingMap).map(([key, value]) => `  ${key}: "${value}"`).join('\n')}
---`;
}

function generateMarkdownBody(
	tokens: DesignTokens,
	designPhilosophy: string,
	componentGuidance: string,
	dosAndDonts: string
): string {
	return `# Design System

## Overview

${designPhilosophy || 'This is a design system extracted from a website. It captures the core design language including colors, typography, spacing, and component patterns.'}

## Colors

| Color | Value | Usage |
|-------|-------|-------|
${tokens.colors.slice(0, 12).map(c => `| Color ${tokens.colors.indexOf(c) + 1} | ${c.value} | Primary color |`).join('\n')}

## Typography

| Font | Properties |
|------|------------|
${tokens.typography.slice(0, 8).map(t => `| ${t.fontFamily} | Size, weight, line-height |`).join('\n')}

## Spacing Scale

Spacing values used throughout the design:

\`\`\`
${tokens.spacing.slice(0, 10).map(s => `${s.value} (${s.frequency} occurrences)`).join('\n')}
\`\`\`

## Components

${tokens.components.map(c => `### ${c.name}
${c.description ? `${c.description}` : 'Component guidance'}
`).join('\n')}

${componentGuidance ? `## Component Guidance

${componentGuidance}` : ''}

${dosAndDonts ? `## Do's and Don'ts

${dosAndDonts}` : ''}

## Shapes & Elevation

### Border Radius
${tokens.shapes?.slice(0, 5).map(s => `- ${s.borderRadius}`).join('\n') || '- Standard rounded corners\n- Medium rounded corners\n- Full rounded (circles)'}

### Shadows
${tokens.elevation?.slice(0, 5).map(e => `- ${e.value}`).join('\n') || '- Subtle shadows for depth\n- Medium elevation shadows\n- Strong shadows for modals'}

---

*Generated design system specification for AI-assisted development.*
`;
}
