# sarashina-mercury

**Sarashina, in your hands. A PWA client for a Japanese LLM that runs with a single API key.**

sarashina-mercury is a PWA that lets you use SB Intuitions' Japanese large language model "Sarashina" directly from your browser. It stores your own Sarashina API key locally (in the browser) and provides chat, translation, RAG, and Guard as a single installable app that also works offline. The editing experience is inspired by Mercury Editor.

> **Backing the richness of Japanese with technology.** Euphemism, omission, and inference from context — sarashina-mercury aims to deliver the richness Sarashina embodies not as a list of features but as an editing experience, right in your hands.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v0.1.3-blue.svg)](https://github.com/watanabe3tipapa/sarashina-mercury/releases)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-blue.svg)](https://watanabe3tipapa.github.io/sarashina-mercury/)
[![GitHub](https://img.shields.io/github/issues/watanabe3tipapa/sarashina-mercury.svg)](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

[日本語](README.md) | [English](README_en.md)

**Quick links:** [Live site](https://watanabe3tipapa.github.io/sarashina-mercury/) · [Open the app](https://watanabe3tipapa.github.io/sarashina-mercury/app/) · [UX/UI guide](https://watanabe3tipapa.github.io/sarashina-mercury/guide.html) · [Implementation plan](./IMPLEMENTATION_PLAN.md) · [Issues](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

## Concept

### Why "Mercury"

**Backing the richness of Japanese with technology.** Sarashina API is a model that embodies the character of the Japanese language. Rather than listing features, sarashina-mercury elevates the richness of Japanese — euphemism, omission, and inference from context — into an editing experience, with Mercury Editor as its model. By keeping your API key out of any server and connecting only your browser directly to the Sarashina API, it aims to be a comfortable PWA that preserves your data sovereignty.

| Activity | In sarashina-mercury |
|---|---|
| Converse | Streaming chat with `sarashina3-mini` / `sarashina3-nano` |
| Translate | Tone-aware translation with `sarashina3-translate` |
| Find evidence | RAG with `sarashina3-embedding` + `sarashina3-rerank` |
| Check safety | Input/output safety classification with `sarashina3-guard` |
| Work offline | Installable PWA via `vite-plugin-pwa` + Workbox |
| Carry your key | API key stored only in `localStorage` (never sent to a server) |

### Supported models

| Model ID | Context | Primary use | API category |
|---|---|---|---|
| `sarashina3-mini` | 128k tokens | General chat, tool-calling, math and coding | Chat Completions |
| `sarashina3-nano` | 128k tokens | High-throughput batch processing (extraction, summarization, classification) | Chat Completions |
| `sarashina3-guard` | 64k tokens | Input/output safety classification and moderation | Chat Completions |
| `sarashina3-embedding` | 8,000 tokens | Text vectorization, RAG candidate retrieval | Embeddings |
| `sarashina3-rerank` | 8,000 tokens | Relevance scoring between a query and documents | Rerank |
| `sarashina3-translate` | 5,000 characters | JA↔EN translation (context and tone aware) | Translate |

### UX/UI principles

1. **Respect the "ma" of Japanese** — assume omission and euphemism, and help infer intent rather than forcing complete sentences
2. **Make politeness visible** — select and preview the tone (polite, humble, honorific)
3. **Design the delay** — reduce the anxiety of waiting with streaming output and visible progress
4. **Be transparent about safety** — present Guard results not as a threat but as a positive path to recovery

## Features

### Functionality

- **Chat** — switchable streaming chat with `sarashina3-mini` / `sarashina3-nano`, rendering Markdown + GFM, with a "Stop" button to interrupt generation
- **Translation editor** — a Lexical-based parallel editor. Choose direction (JA→EN / EN→JA) and tone (`business-formal` / `business-casual` / `technical` / `marketing`), hover a paragraph to pair it across panes, and edit, copy, or swap the translation in place
- **RAG** — Embeddings + Rerank over a query and documents, showing relevance-ranked results with their sources; answer generation can also be interrupted
- **Guard** — classifies input and output text for safety, explaining the reason per category and offering a "try another expression" recovery path instead of a blunt block. Optional automatic checks before sending and after responding in chat / translation / RAG
- **Settings** — save and switch the API key and default model in the browser; the API key can optionally be kept session-only (`sessionStorage`). Choose system / light / dark theme (follows `prefers-color-scheme`)

### Architecture

- A Vite + React + TypeScript SPA
- Styled with Tailwind CSS v4
- Page routing with `react-router-dom`
- State persistence with `zustand` + `persist`, conversation history in IndexedDB
- Direct calls to the Sarashina API (with SSE streaming)

### PWA / Offline

- Precaches the app shell with `vite-plugin-pwa` (Workbox, `generateSW`)
- The manifest is Japanese (`lang: "ja"`) and ships both standard and maskable icons
- Adding it to your home screen launches it as a standalone app

## Installation and build

### Requirements

| Tool | Required version | Check command |
|---|---:|---|
| Node.js | >= 20 | `node --version` |
| pnpm (recommended) | >= 9 | `pnpm --version` |

Get a Sarashina API key from [SB Intuitions / Sarashina](https://www.sbintuitions.co.jp/).

### Basic steps

1. Clone the repository

```bash
git clone https://github.com/watanabe3tipapa/sarashina-mercury.git
cd sarashina-mercury
```

2. Install dependencies

```bash
pnpm install
```

3. Start the dev server

```bash
pnpm dev
```

Then register your API key under "Settings" in the app to use each feature.

4. Production build

```bash
pnpm build
```

The build output goes to `dist/`. Preview it with `pnpm preview`.

### Main commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server (HMR) |
| `pnpm build` | Type check (`tsc -b`) + production build |
| `pnpm preview` | Preview the build output locally |
| `pnpm lint` | Static analysis with oxlint |

### Deployment

On push to `main`, [GitHub Actions](./.github/workflows/deploy-pages.yml) builds and deploys the landing page and app to GitHub Pages.

| Path | Content |
|---|---|
| `/` | Landing page (`docs/`) |
| `/app/` | The app (Vite build output) |
| `/guide.html` | UX/UI guide |

- The app is served under a sub-path, so the build sets `BASE_PATH=/sarashina-mercury/app/` (reflected in Vite's `base`).
- Routing uses `import.meta.env.BASE_URL` as its `basename`, with a `404.html` fallback for SPA deep links.
- Change `BASE_PATH` to serve under a different path.
- For the published app to reach the API, set the repository variable `SARASHINA_API_BASE` to your Worker URL (e.g. `https://sarashina-proxy.<your-subdomain>.workers.dev/v1`); it is injected into the build as `VITE_SARASHINA_API_BASE`.

## Security

- The API key is stored in `localStorage` and is never sent anywhere other than the Sarashina API
- The API is called directly from the browser without a server (subject to the API's CORS settings)
- Avoid using it on public devices, and rotate your key when necessary

## CORS and proxy (Cloudflare Worker)

Because the Sarashina API does not return CORS headers, direct browser calls are blocked. This repository includes a thin proxy (`worker/`) that only relays requests. The API key is stored in the browser and passed through the proxy via the `Authorization` header on each request (the proxy stores no keys).

```bash
cd worker
pnpm install
pnpm dev      # start the proxy locally
pnpm deploy   # deploy to Cloudflare
```

After deploying, point the app at the Worker URL at build time.

```bash
# .env
VITE_SARASHINA_API_BASE=https://sarashina-proxy.<your-subdomain>.workers.dev/v1
```

- With `pnpm dev` (the app), Vite's dev proxy is used automatically, so the Worker is not needed.
- In production builds you must set `VITE_SARASHINA_API_BASE` (otherwise the app calls the Sarashina API directly and fails on CORS).
- When publishing, restrict `ALLOWED_ORIGIN` in `worker/wrangler.toml` to your app's origin.

### Known limitation: the API is limited to access from within Japan

Due to AWS WAF, the Sarashina API **rejects requests from regions outside Japan with `403 Forbidden`** (verified: Tokyo NRT/KIX edges return `401` = auth reached, while US/AU edges return an upstream `403`).

Because a Cloudflare Worker may run outside Japan depending on the edge region, such requests return `403`. Current mitigations:

- **Smart Placement** (`[placement] mode = "smart"`) in `worker/wrangler.toml` encourages execution near the origin (Japan).
- The app (`src/lib/api/sarashina.ts`) retries up to 3 times on `403` / `429`, re-rolling the edge region.

> **Note**: `*.workers.dev` may land on an edge outside Japan even for domestic clients, and Smart Placement is best-effort, so success is not guaranteed. For more reliability, consider:
>
> - Attaching a **custom domain** to Cloudflare (domestic users are then more likely to land on NRT/KIX)
> - A proxy pinned to a Japan region (Google Cloud Run `asia-northeast1`, AWS Lambda `ap-northeast-1`)

## Directory layout

```text
src/
├── App.tsx                       # Routes
├── main.tsx                      # Entry point
├── features/
│   ├── chat/ChatPage.tsx          # Chat (streaming)
│   ├── settings/SettingsPage.tsx  # API key / model / theme settings
│   └── tools/
│       ├── TranslatePage.tsx      # Translation editor (Lexical, tone control)
│       ├── RAGPage.tsx            # Rerank + chat (answers with citations)
│       └── GuardPage.tsx          # Safety classification with a recovery path
├── components/
│   ├── SourceCitation.tsx         # Citation card (relevance bar, scroll)
│   ├── GuardNotice.tsx            # Gentle Guard warning (category reasons, rewrite tips)
│   ├── ErrorBoundary.tsx          # App-wide fallback for unexpected errors
│   └── editor/EditorPane.tsx      # Lexical editor (parallel translation)
├── hooks/
│   └── useThemeSync.ts            # Applies the theme and follows the OS setting
├── lib/
│   ├── api/sarashina.ts           # Sarashina API client
│   ├── db/conversations.ts        # Conversation persistence (IndexedDB)
│   ├── theme.ts                   # Theme resolution (system / light / dark)
│   ├── tokens.ts                  # Token estimation
│   └── utils.ts                   # Class name utility (cn)
└── store/
    ├── useChatStore.ts            # Conversation list state (zustand)
    └── useSettingsStore.ts        # Settings persistence (zustand)

docs/                              # Landing page (GitHub Pages root)
public/                            # Icons and manifest assets
scripts/build-404.mjs              # Generates the SPA 404.html
worker/                            # Cloudflare Worker proxy for CORS
├── src/index.ts                   # Request relay + CORS headers
└── wrangler.toml                  # Worker config
```

## Roadmap

### v0.1.3 (released)

- [x] Optional automatic Guard checks before sending and after responding (chat / translation / RAG; toggle in settings)
- [x] Stream interruption (stop buttons in chat / translation / RAG)
- [x] Guard recovery UI (per-category reasons, rewrite tips, re-check)
- [x] Optional session-only API key storage (`sessionStorage`)
- [x] Light theme (follows `prefers-color-scheme`; system / light / dark)
- [x] App-wide ErrorBoundary (fallback for unexpected errors)
- [x] Fallback and notice when IndexedDB is unavailable (private mode, etc.)
- [x] Unit tests with Vitest + React Testing Library (API client, stores, UI)
- [x] Add a lint step to CI

### v0.1.4 (planned)

- [ ] Real-time token / cost estimation
- [ ] Custom domain / Japan-pinned proxy for CORS stability

### v0.1.2 (released)

- [x] Translation editor (Lexical-based parallel translation, paragraph hover sync, in-place editing)
- [x] Code-split tool pages (keep Lexical out of the initial bundle)
- [x] Unified LP/guide design and a full documentation review

### v0.1.1

- [x] Inject `VITE_SARASHINA_API_BASE` from a CI variable so production can reach the API
- [x] Forward `Accept` through the Worker to keep SSE streaming working
- [x] Harden Worker CORS with Origin checks + `Vary: Origin`, and restrict paths to `/v1/`
- [x] Add Markdown styling (fixes the inert `prose` classes)
- [x] Remove unused dependencies and tidy the configuration

### v0.1.0

- [x] Vite + PWA setup
- [x] API key settings screen (stored locally)
- [x] Chat (`sarashina3-mini` / `sarashina3-nano`) + streaming responses
- [x] Translation (tone control)
- [x] RAG (Embeddings + Rerank)
- [x] Guard (safety classification)
- [x] Conversation history persistence (IndexedDB)
- [x] System prompt settings
- [x] Citation display (SourceCitation) and scroll to sources
- [x] Landing page and GitHub Pages deployment

## Documentation

1. [UX/UI guide](https://watanabe3tipapa.github.io/sarashina-mercury/guide.html) — model selection, UI patterns per endpoint, design tokens, and an adoption workflow (source: [`sarashina_api_uxui_guide.html`](./sarashina_api_uxui_guide.html))
2. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — the MVP plan
3. [Live site](https://watanabe3tipapa.github.io/sarashina-mercury/) — landing page and app

## Contributing

Contributions are welcome. Before making a large change, please open an [Issue](https://github.com/watanabe3tipapa/sarashina-mercury/issues) to discuss it. The general steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push the branch and open a Pull Request

## Contact

- GitHub: https://github.com/watanabe3tipapa/sarashina-mercury
- Live site: https://watanabe3tipapa.github.io/sarashina-mercury/

## License

MIT License — see the [LICENSE](LICENSE) file for details.

"Sarashina" is the name of a model provided by SB Intuitions; this project is an unofficial client unaffiliated with the company. Use of the model and API is subject to SB Intuitions' terms.
