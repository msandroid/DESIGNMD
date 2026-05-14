/**
 * Prompt templates for design system generation
 */

export const DESIGN_PHILOSOPHY_PROMPT = `Analyze the following design tokens and generate a brief design philosophy (2-3 sentences).

Colors (top colors used):
{colors}

Typography (fonts used):
{fonts}

Spacing scale:
{spacing}

Components identified:
{components}

Based on these tokens, describe the overall design philosophy and visual aesthetic.`;

export const COMPONENT_GUIDANCE_PROMPT = `Based on the following design tokens, provide guidance on how to build components effectively.

Colors: {colors}
Fonts: {fonts}
Spacing: {spacing}

Provide specific guidance for:
1. Buttons
2. Cards
3. Form inputs
4. Modals

Keep each section concise (1-2 sentences).`;

export const DOS_AND_DONTS_PROMPT = `Based on the extracted design system tokens, create 3 design guidelines (do's) and 3 anti-patterns (don'ts) that preserve this design system's integrity.

Current design:
- Primary colors: {colors}
- Typography: {fonts}
- Spacing: {spacing}

Format as:
Do:
- Guideline 1
- Guideline 2
- Guideline 3

Don't:
- Anti-pattern 1
- Anti-pattern 2
- Anti-pattern 3`;

export const DESIGN_OVERVIEW_PROMPT = `Create a comprehensive but concise design system overview (3-4 paragraphs) based on these tokens:

Colors: {colors}
Typography: {fonts}
Spacing: {spacing}
Components: {components}

The overview should describe:
1. The overall aesthetic and mood
2. Key design principles
3. How tokens work together
4. Who this design system is for`;
