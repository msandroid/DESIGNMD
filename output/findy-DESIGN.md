---
name: Findy (findy-code.io)
version: 1.0.0
source_url: "https://findy-code.io/home"
extracted_with: design-extractor (HTML token scan, 2026-05-13)

colors:
  color1: "#155aa8"
  color2: "#23527c"
  color3: "#333333"
  color4: "#3d4145"
  color5: "#ffffff"
  color6: "#000000"
  color7: "#eeeeee"
  color8: "#056dc1"
  color9: "#E8F3FD"
  color10: "#FBC53B"

typography:
  font1:
    fontFamily: "Noto Sans JP"
    fontSize: "16px"
    fontWeight: 400
  font2:
    fontFamily: "Noto Sans JP"
    fontSize: "14px"
    fontWeight: 400
  font3:
    fontFamily: "Noto Sans JP"
    fontSize: "18px"
    fontWeight: 700
  font4:
    fontFamily: "Noto Sans JP, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 500
  font5:
    fontFamily: "Noto Sans JP"
    fontSize: "12px"
    fontWeight: 400

spacing:
  space1: "4px"
  space2: "8px"
  space3: "12px"
  space4: "16px"
  space5: "24px"
  space6: "32px"
  space7: "40px"
  space8: "48px"
---

# Design System

## Overview

Findy is an IT/Web engineer career and job-matching product ([findy-code.io](https://findy-code.io/)). Public messaging emphasizes builders (“つくる人が世界を面白くする”) and data-backed skill signals (e.g. GitHub-derived signals). This document describes the **visual language observed on the `/home` entry** (login-oriented shell: global header, primary navigation, registration CTA, footer) plus **extended marketing palette tokens** present on the marketing top route for product-wide consistency.

The UI is **clean, trust-forward, and content-led**: high-contrast text on white, a single strong blue for links and brand moments, and restrained neutrals for structure. Avoid decorative noise; prefer clear hierarchy and predictable interactive states (default → hover → active).

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| Brand primary | `#155aa8` | Logo adjacency, primary links, key actions |
| Brand primary (deep) | `#23527c` | Hover/active states for primary blue |
| Marketing accent blue | `#056dc1` | Campaign sections / gradients on LP routes |
| Text primary | `#333333` | Body copy, default text |
| Text secondary | `#3d4145` | Navigation labels, secondary UI text |
| Text strong | `#000000` | Emphasis, icons-on-light |
| Surface | `#ffffff` | Page background, cards on default chrome |
| Border / divider | `#eeeeee` | Hairlines, separators, subtle panels |
| Tint surface | `#E8F3FD` | Soft informational bands (marketing pages) |
| Accent highlight | `#FBC53B` | Badges, highlights, sparing promotional accents |

## Typography

| Role | Font | Notes |
|------|------|------|
| UI / body | Noto Sans JP | Primary family referenced from served HTML |
| Nav / dense UI | Noto Sans JP 14px | Compact navigation and footer clusters |
| Heading emphasis | Noto Sans JP 700 | Section titles where weight is needed |
| System fallback stack | -apple-system, Segoe UI, sans-serif | Use after Noto Sans JP in `font-family` |

Line-height: prefer **1.5–1.6** for Japanese body text. Keep line length comfortable (~45–75 characters where possible).

## Spacing Scale

Spacing values for consistent rhythm (inferred from common layout patterns; align to your component library):

```
4px (tight inline gaps)
8px (icon-text gaps, compact stacks)
12px (form control internal rhythm)
16px (default component padding)
24px (section gaps in dense chrome)
32px (section gaps in marketing blocks)
40px (large vertical separation)
48px (hero / major section padding)
```

## Components

### Global header

Horizontal bar with **Findy wordmark** (`/images/logo.svg`), primary nav links (求人・企業検索, メディア, イベント, Findy Freelance, 採用担当者の方はこちら), and account actions (**ログイン**, **新規登録**). Background is white; text uses secondary gray with **primary blue** for emphasis on actions.

### Primary navigation links

Text links with clear hover shift toward **brand primary deep** (`#23527c`). Maintain large tap targets on mobile; avoid relying on color alone for state (underline or weight on hover/focus).

### Registration CTA

**新規登録** is the primary acquisition action on the auth shell. Treat as **filled primary** (blue background, white label) when implementing new UI; **ログイン** as secondary (outline or text button).

### Footer (mega-structure)

Multi-column footer with grouped links (求人・企業検索, メディア, イベント, 関連サービス) and legal/meta links (運営企業, 利用規約, プライバシーポリシー, お問い合わせ). Use **#eeeeee** top border or generous white space to separate from content.

### Auth / home shell

The `/home` route is framed as a **login gateway** in the product title metadata. Keep forms simple: single-column, generous vertical spacing, explicit error text in **text primary** (not color-only).

## Component Guidance

- **One accent system**: default to `#155aa8` for interactive brand color; reserve yellow (`#FBC53B`) for highlights, not large fills.
- **Japanese-first copy**: allow slightly larger minimum font sizes (15–16px body) for readability.
- **Trust & clarity**: prefer neutral surfaces; use tinted blue (`#E8F3FD`) only for informational callouts, not full-page backgrounds on transactional flows.
- **Accessibility**: ensure contrast for `#155aa8` text on white meets WCAG for normal text size; use darker blue or `#333333` for small labels if needed.

## Do's and Don'ts

**Do**

- Use Noto Sans JP (with system fallbacks) across product UI for consistency with [Findy](https://findy-code.io/home).
- Pair blue CTAs with clear verbs (登録, ログイン, 検索).
- Keep header/footer patterns stable across marketing and app chrome.

**Don't**

- Do not introduce a second unrelated primary hue without strong reason (avoid rainbow marketing gradients on transactional pages).
- Do not shrink navigation below readable sizes on mobile; use overflow patterns instead.
- Do not rely on GitHub or third-party brand colors except where showing **authentic** integrations (e.g. GitHub mark in context).

## Shapes & Elevation

### Border radius

- **Buttons / inputs**: 4–6px (subtle; corporate SaaS tone).
- **Cards / modals**: 8–12px when needed on marketing surfaces.
- **Pills / tags**: full pill (`9999px` or `50%` height) for compact labels.

### Shadows

- **Default**: none or very soft `0 1px 2px rgba(0,0,0,0.06)` for elevated cards only.
- **Dropdowns / popovers**: `0 4px 24px rgba(0,0,0,0.12)` maximum; avoid heavy skeuomorphism.

---

*Generated design system specification for AI-assisted development. Colors for `/home` were verified via HTML scan; extended palette entries reflect additional routes on findy-code.io for cross-page consistency.*
