<h1 align="center">WinPilot</h1>

<p align="center">
  A commerce operations platform that keeps design and code from drifting apart<br />
  by treating the running screen as the source of truth.<br />
  The storefront, the operations admin, and the internal console share one glossary and one set of design tokens.
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white" />
</p>

<p align="center">
  <a href="./README.md">한국어</a> ·
  <strong>English</strong> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## Background

Design and code look identical at first, then quietly diverge. The split usually starts with **words**, not layout. The moment the storefront calls something `product` and the admin calls it `item`, there is no mechanical way to pair the two implementations — from then on a human has to decide which one is right, every time.

Hand-syncing Figma with code hits the same wall. Extracting design from code statically means reimplementing the browser's layout engine: `lab()` colors, `calc()` line heights, glyph-level font fallback, whitespace collapsing. What you get still differs from the real screen.

This repository goes the other way. **The running screen is the source.** We read the values the browser computed, turn them into an intermediate representation (UIR), and draw Figma from that. And names are kept aligned by a checker rather than by anyone's attention.

## Purpose

- **One name per thing** — features, entities, routes, component names, i18n keys, test IDs, and Figma frame names all derive from a single registry. Anything that skipped it is caught by `pnpm spec:check`.
- **One design source** — colors, spacing, fonts, and motion live in `@winpilot/tokens` and every app pulls from it. The moment an app declares its own color, the design system exists twice.
- **Docs next to screens** — design docs live inside the app and open at a URL (`/ia`, `/path`). Change a screen without the doc and it shows immediately.
- **Many templates, no drift** — storefront templates differ only in layout. Values, wording, routes, and slot names all come from one contract (`@winpilot/client-content`).

## Languages and libraries

| Area | Choice | Note |
| --- | --- | --- |
| Language | TypeScript 5.7 | `strict`, shared config across packages |
| Framework | Next.js 16 (App Router) · React 19 | Server components by default |
| Styling | Tailwind CSS 4 | CSS-first `@theme`; tokens compile to CSS variables |
| Fonts | Pretendard · JetBrains Mono | Self-hosted — generic families don't exist in Figma |
| Packages | pnpm workspace | Apps, packages, and tools in one repository |
| Verification | Zod · Playwright · pngjs | Schema, capture, pixel comparison |
| Runtime | tsx · esbuild | Tool scripts and the Figma plugin bundle |

Charts, markdown, and icons are **drawn by hand rather than pulled from libraries.** Most chart libraries render to canvas, and canvas is a block of pixels — the extractor can only take it as one flat image. SVG elements are real DOM nodes, so they come back as vectors and axis labels stay as text.

## Directory

```
WinPilot-Product/
├── apps/
│   ├── b2c-client-a/       Storefront · template A (3310)
│   ├── b2c-admin/          Operations admin (3301)
│   └── internal-admin/     Internal tenant console (3302)
│
├── packages/
│   ├── spec/               Feature registry · glossary · naming checker
│   ├── tokens/             Design tokens (theme.css) — the only source for every app
│   ├── store/              Stored values — one copy, read by admin and storefront alike
│   ├── ui/                 UI primitives shared across apps
│   ├── client-content/     Storefront content contract — shared by templates A–F
│   └── uir/                UI intermediate representation · tolerance definitions
│
├── tools/
│   ├── extractor/          Running screen → UIR (Playwright)
│   └── verifier/           Two-stage numeric · pixel verification
│
├── figma-plugin/           UIR → Figma nodes
└── docs/
    ├── spec/               Path · naming · flow · IA · components · design system · functional · non-functional
    └── architecture/       Pipeline design
```

Each app owns its `pages.manifest.ts`. Figma page order and names are decided in that one file and nowhere else.

Data lives in `packages/store` only. The admin's `lib/data/*` merely re-exports it, and the storefront reads the same values through `client-content` — keep two seed copies and the admin will show something different from the storefront, with no way to tell which is right.

## Getting started

### Setup

```bash
# Node 20+, pnpm 9+
pnpm install
```

### Dev servers

```bash
pnpm dev:client      # Storefront template A   http://localhost:3310
pnpm dev:admin       # Operations admin        http://localhost:3301
pnpm dev:internal    # Internal console        http://localhost:3302
```

### Checks

```bash
pnpm spec:check      # Naming · route · manifest consistency (exits 1 on error)
pnpm spec:matrix     # Print the feature ↔ view matrix
pnpm typecheck       # Type-check the whole workspace
pnpm build           # Build everything
```

### Design sync

```bash
pnpm ssot:tokens                    # Extract tokens into UIR form
pnpm ssot:extract --app b2c-admin   # Capture running screens and produce UIR
pnpm ssot:verify                    # Numeric (ε=1e-4) and pixel verification
pnpm ssot:selftest                  # Verifier self-test (7 scenarios)

pnpm figma:build                    # Bundle the Figma plugin
```

`ssot:extract` needs a dev server running. Output lands in `artifacts/` and is not committed.

### Reading the docs

Start a dev server and open them directly.

```
http://localhost:3310/docs            Doc index and screen list
http://localhost:3310/ia              Information architecture
http://localhost:3310/path            Path definitions
http://localhost:3310/component       Component definitions
```
