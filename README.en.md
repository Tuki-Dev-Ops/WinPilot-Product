<h1 align="center">WinPilot</h1>

<p align="center">
  An operations platform that keeps design and code from drifting apart<br />
  by treating the running screen as the source of truth.<br />
  Storefronts and operations consoles across three products — commerce, IR, and F&amp;B franchise — plus the internal console:<br />
  seven apps sharing one glossary and one set of design tokens.
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
- **Docs next to screens** — design docs live inside the app and open at a URL (`/docs/ia`, `/docs/path`). All seven apps carry the same fourteen doc routes, and one screen is one document. Change a screen without the doc and `pnpm docs:check` catches it.
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
├── apps/                                     Three products × (storefront + operations console) + internal
│   ├── b2c-client-a/       Commerce storefront · template A (3310)
│   ├── b2c-admin/          Commerce operations console (3301)
│   ├── ir-client-a/        IR site · template A (3304)
│   ├── ir-admin/           IR operations console (3303)
│   ├── fnb-client-a/       F&B brand site · template A (3305)
│   ├── fnb-admin/          F&B brand operations console (3306)
│   └── internal-admin/     Internal tenant console (3302)
│
├── packages/
│   ├── spec/               Feature registry · glossary · naming checker
│   ├── tokens/             Design tokens (theme.css) — the only source for every app
│   ├── store/              Stored values — one copy, read by admin and storefront alike
│   ├── ui/                 UI primitives shared across apps
│   ├── docs/               Pieces the doc routes use — reading (fs) and rendering split at the entry point
│   ├── client-content/     Storefront content contract — shared by templates A–F
│   ├── geo/                Administrative boundary shapes — read together by map screens
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

Every product pairs **a storefront with an operations console**. Both sides handle the same resources, so a feature that exists on only one side is treated as a probable omission, and `pnpm spec:check` counts the pairs. The internal console has no counterpart — it is a different product, one that manages tenants.

Data lives in `packages/store` only. The admin's `lib/data/*` merely re-exports it, and the storefront reads the same values through `client-content` — keep two seed copies and the admin will show something different from the storefront, with no way to tell which is right.

## Getting started

### Setup

```bash
# Node 20+, pnpm 9+
pnpm install
```

### Dev servers

```bash
pnpm dev:client      # Commerce storefront          http://localhost:3310
pnpm dev:admin       # Commerce operations console  http://localhost:3301
pnpm dev:ir          # IR site                      http://localhost:3304
pnpm dev:ir-admin    # IR operations console        http://localhost:3303
pnpm dev:fnb         # F&B brand site               http://localhost:3305
pnpm dev:fnb-admin   # F&B operations console       http://localhost:3306
pnpm dev:internal    # Internal console             http://localhost:3302
```

We don't bring them all up with `pnpm -r dev` — when one dies it takes the rest down with it, and the log never says which one went first.

### Checks

```bash
pnpm spec:check      # Naming · route · manifest consistency (exits 1 on error)
pnpm spec:matrix     # Print the feature ↔ view matrix
pnpm sync:check      # Whether a component name in the registry is that name on disk too
pnpm docs:check      # Screen ↔ docs — count screens missing IA, flow, or functional spec
pnpm docs:build      # Expand functional and non-functional specs from the source (lib/screen-specs.ts)
pnpm overflow:check  # Measure horizontal overflow at four widths (needs a dev server running)
pnpm typecheck       # Type-check the whole workspace
pnpm build           # Build everything
```

There are several checkers because each one watches for **a different kind of drift**. `spec:check` only sees the rules inside the registry, so registering a name and then creating the file under a different one still passes — `sync:check` covers that gap. Adding one screen means touching four places (manifest · IA · flow · spec), and missing one of them leaves the app running perfectly fine, so `docs:check` counts them.

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

Start a dev server and open them directly. **All seven apps carry the same routes** — below is the commerce storefront (3310); change the port and the other six are identical.

```
http://localhost:3310/docs                     Overview — doc branches and screen list
http://localhost:3310/docs/ia                  IA — the whole map and per-screen maps
http://localhost:3310/docs/flow-chart          Flow charts — journeys and per-screen flows
http://localhost:3310/docs/fsd                 Functional spec — one screen, one document
http://localhost:3310/docs/nfs                 Non-functional spec — one policy, one document
http://localhost:3310/docs/page-view           Captures at three widths for every screen
http://localhost:3310/docs/components          Component definitions
http://localhost:3310/docs/design-system       Design system
http://localhost:3310/docs/path                Path definitions
http://localhost:3310/docs/coding-conventions  Naming convention definitions
http://localhost:3310/docs/admin-mapping       Admin wiring — which value comes from where
http://localhost:3310/docs/prompt              The prompt used to rebuild this doc set
```

The internal console is the one exception: its second-to-last route is `/docs/deployment-mapping` — the values that console decides go not to a storefront but to **a tenant's deployment**.

Functional and non-functional specs are **generated**. The source sits in each app's `lib/screen-specs.ts` and `pnpm docs:build` expands it — write them by hand and the doc outlives the screen you changed, and an outlived doc is soon a lie.
