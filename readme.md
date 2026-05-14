# Design Extractor - VS Code Extension

Extract design systems from any website and generate `DESIGN.md` files with a local LLM (llama.cpp).

## Features

- 🎨 **Extract Design Tokens** — Colors, typography, spacing, shadows, and border radius from website HTML
- 📄 **Generate DESIGN.md** — AI-enhanced design system specification with YAML front matter + Markdown prose
- 🎯 **Multiple Output Formats**:
  - `DESIGN.md` (primary) with YAML design tokens + prose rationale
  - Tailwind v4 `@theme {}` block
  - CSS custom properties `:root {}` block
  - Design Tokens Community Group (DTCG) W3C format
- 🧠 **Local LLM Integration** — Uses your local `llama.cpp` server to generate design philosophy, component guidance, and do's/don'ts
- 🔄 **Hybrid Extraction** — Precise CSS token analysis + LLM-generated design rationale

## Requirements

1. **Node.js 16+** — For running the extension
2. **llama.cpp** — Running locally for LLM inference (optional but recommended)
3. **VS Code 1.92+**

## Setup

### 1. Install Extension

Clone this repository and open in VS Code:

```bash
cd BuildBasement
npm install
npm run compile
```

Then press `F5` to launch the extension in a new VS Code window, or package it with:

```bash
npm run vscode:prepublish
vsce package
```

### 2. Set Up llama.cpp (Recommended)

To use LLM features for enhanced design prose generation:

```bash
# Download and run llama.cpp with your model
./llama-server -m model.gguf -c 2048 --port 8000
```

The extension expects llama.cpp to be running on `http://localhost:8000`.

**Models tested:**
- Llama 2 7B (good for design descriptions)
- Mistral 7B (fast, reasonable quality)
- Neural Chat (optimized for instruction following)

If llama.cpp is not available, the extension falls back to template-based descriptions.

## Usage

### 1. Extract Design from URL

Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) or run command: **Design Extractor: Extract Design System from URL**

2. Enter the website URL

3. Wait for extraction:
   - Fetches HTML content
   - Analyzes CSS for design tokens
   - Generates design prose via LLM (if available)
   - Formats outputs in 4 formats

4. Preview the results in the webview panel

5. Download any of the 4 formats:
   - `DESIGN.md` — Ready to drop into your repo
   - `tailwind.css` — Paste into Tailwind v4 config
   - `variables.css` — Import into your stylesheet
   - `tokens.json` — Import into design tool (Figma, Tokens Studio, etc.)

### Example

Extract from `https://design-extractor.com/`:

```
✓ Colors: 15 unique colors extracted
✓ Typography: 8 fonts identified
✓ Spacing: 10 scale values
✓ Components: 4 component patterns found
✓ LLM generated: Philosophy, guidance, do's/don'ts
```

Download `DESIGN.md` and drop into your repo root. AI agents will now reference your design system:

```bash
# Cursor, Windsurf, Claude Code, etc.
@DESIGN.md Use this design system for all UI generation.
```

## Architecture

```
src/
├── extension.ts              # VS Code extension entry point
├── webview-manager.ts        # Orchestrates extraction & LLM calls
├── extractors/
│   ├── types.ts             # Shared TypeScript interfaces
│   ├── htmlFetcher.ts       # Fetch HTML from URL
│   └── cssParser.ts         # Extract tokens from CSSOM
├── llm/
│   ├── llamaClient.ts       # llama.cpp API client
│   └── prompts.ts           # Prompt templates
├── formatters/
│   ├── designMdFormatter.ts # DESIGN.md generator
│   ├── tailwindFormatter.ts # Tailwind v4 formatter
│   ├── cssVarFormatter.ts   # CSS variables formatter
│   └── dtcgFormatter.ts     # DTCG JSON formatter
└── webview/
    └── main.html            # Webview UI
```

## How It Works

### 1. HTML Extraction
- Fetches URL content with timeout & error handling
- Parses HTML with Cheerio
- No headless browser (lightweight)

### 2. CSS Token Analysis
- Analyzes inline styles, `<style>` tags
- Frequency analysis of:
  - Colors (hex, rgb, hsl)
  - Fonts (from `<link>` tags, inline styles)
  - Spacing (padding, margin, gap)
  - Shadows & border-radius
- Identifies component patterns (buttons, cards, modals, inputs)

### 3. LLM Enhancement (Optional)
- Sends extracted tokens + structured prompts to llama.cpp
- LLM generates:
  - **Design Philosophy** — Overall aesthetic & mood
  - **Component Guidance** — Best practices per component
  - **Do's & Don'ts** — Design guardrails
- Falls back to templates if LLM unavailable

### 4. Format Generation
- **DESIGN.md** — YAML front matter + prose explanation
- **Tailwind v4** — `@theme {}` block with CSS variables
- **CSS Variables** — `:root {}` with custom properties
- **DTCG** — W3C-standard JSON for design tools

## Configuration

Configure llama.cpp endpoint by editing `src/webview-manager.ts`:

```typescript
// Line 10: Change default port if needed
webviewManager = new WebviewManager(context, 'http://localhost:8000');
```

Or set via environment variable `LLAMA_SERVER_URL`.

## Troubleshooting

### LLM requests timeout
- Increase `timeout` in `llamaClient.ts` (line 24)
- Ensure llama.cpp has sufficient VRAM/memory
- Use a smaller model

### No colors/fonts extracted
- Website may use CSS-in-JS or shadow DOM
- Try a website with more static HTML/CSS
- Check browser console for parse errors

### Webview doesn't load
- Ensure extension compiled: `npm run compile`
- Check VS Code version is 1.92+
- Restart VS Code

## Development

### Compile & Watch
```bash
npm run compile      # One-time build
npm run watch       # Watch mode for development
```

### Run Tests
```bash
npm run test
```

### Debug
1. Press `F5` to launch debug window
2. Set breakpoints in VS Code
3. Run extraction
4. Breakpoints hit in debug window

## Roadmap

- [ ] **Headless browser rendering** — Use Playwright for computed styles (more accurate but slower)
- [ ] **Design token inheritance** — Detect token relationships (e.g., lighter/darker variants)
- [ ] **Component extraction** — Extract full component code patterns
- [ ] **Figma integration** — Direct export to Figma file
- [ ] **Custom LLM selection** — UI to choose different LLM models
- [ ] **Batch extraction** — Extract multiple URLs in sequence
- [ ] **Design diff** — Compare two DESIGN.md files and show differences
- [ ] **Web interface** — Standalone web version at `design-extractor.withgoogle.com`

## References

- [DESIGN.md Spec](https://designmd.app/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/format/)
- [Tailwind v4 @theme](https://tailwindcss.com/docs/v4-beta)
- [llama.cpp Project](https://github.com/ggerganov/llama.cpp)

## Support

If you find this project useful, you can support it on Ko-fi.

<a href="https://ko-fi.com/J3J0TGH72" target="_blank"><img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi6.png?v=6" border="0" alt="Buy Me a Coffee at ko-fi.com" /></a>

[https://ko-fi.com/aoi_android](https://ko-fi.com/aoi_android)

## License

MIT — Built for AI-assisted design development

---

**Made for AI agents (Cursor, Windsurf, Claude Code, etc.)** to generate consistent, brand-aligned UI.
