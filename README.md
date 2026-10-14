# sarashina-mercury

**Sarashina を、あなたの手元で。API キーひとつで動く国産 LLM の PWA クライアント。**

sarashina-mercury は、SB Intuitions の国産大規模言語モデル「Sarashina」をブラウザから直接利用できる PWA です。ユーザー自身の Sarashina API キーをローカル（ブラウザ）に保存し、チャット・翻訳・RAG・Guard の各機能を、オフラインでもインストール可能な単一アプリとして提供します。編集体験は Mercury Editor を参考にしています。

> **日本語の豊かさを技術で支える。** 婉曲表現・省略・文脈推論――Sarashina が体現する日本語の豊かさを、単なる機能の羅列ではなく編集体験として、ユーザーの手元に届けること。それが sarashina-mercury の狙いです。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v0.1.2-blue.svg)](https://github.com/watanabe3tipapa/sarashina-mercury/releases)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-blue.svg)](https://watanabe3tipapa.github.io/sarashina-mercury/)
[![GitHub](https://img.shields.io/github/issues/watanabe3tipapa/sarashina-mercury.svg)](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

[日本語](README.md) | [English](README_en.md)

**クイックリンク:** [公開サイト](https://watanabe3tipapa.github.io/sarashina-mercury/) · [アプリを開く](https://watanabe3tipapa.github.io/sarashina-mercury/app/) · [UX/UI 設計ガイド](https://watanabe3tipapa.github.io/sarashina-mercury/guide.html) · [実装計画](./IMPLEMENTATION_PLAN.md) · [Issues](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

## コンセプト

### なぜ「Mercury」なのか

**日本語の豊かさを技術で支える。** Sarashina API は「日本語らしさ」を体現するモデルです。婉曲表現・省略・文脈推論といった日本語の豊かさを、単なる機能の羅列ではなく編集体験として昇華させる――その手本とするのが Mercury Editor です。sarashina-mercury は、API キーをサーバーに預けず、ブラウザと Sarashina API だけを直接つなぐことで、データ主権を保ったまま快適な PWA を目指します。

| 機能 | sarashina-mercury の対応物 |
|---|---|
| 対話する | `sarashina3-mini` / `sarashina3-nano` によるストリーミングチャット |
| 翻訳する | `sarashina3-translate` によるトーン指定翻訳 |
| 根拠を探す | `sarashina3-embedding` + `sarashina3-rerank` による RAG |
| 安全を確かめる | `sarashina3-guard` による入出力の安全性判定 |
| オフラインで使う | `vite-plugin-pwa` + Workbox によるインストール可能な PWA |
| 鍵を持ち歩く | API キーは `localStorage` にのみ保存（サーバー送信なし） |

### 対応モデル

| モデル ID | コンテキスト | 主な用途 | API カテゴリ |
|---|---|---|---|
| `sarashina3-mini` | 128k tokens | 標準対話、Tool-calling、数学・コーディング | Chat Completions |
| `sarashina3-nano` | 128k tokens | 高速バッチ処理（抽出・要約・分類） | Chat Completions |
| `sarashina3-guard` | 64k tokens | 入出力の安全性判定・モデレーション | Chat Completions |
| `sarashina3-embedding` | 8,000 tokens | テキストベクトル化、RAG 候補抽出 | Embeddings |
| `sarashina3-rerank` | 8,000 tokens | クエリと文書の関連度スコアリング | Rerank |
| `sarashina3-translate` | 5,000 文字 | 日英・英日訳（文脈・トーン考慮） | Translate |

### UX/UI の基本原則

1. **日本語の「間」を尊重する** — 省略や婉曲を前提とし、完全な文の強制より意図の補完を支援する
2. **敬語レベルの可視化** — 丁寧語・謙譲語・尊敬語のトーンを選択・プレビューできる
3. **遅延の設計** — ストリーミング表示と進行状況の可視化で待機の不安を軽減する
4. **安全性の透明性** — Guard の判定は威圧的でなく、前向きな回復導線として提示する

## 主な特徴

### 機能

- **チャット** — `sarashina3-mini` / `sarashina3-nano` を切替可能なストリーミング対話。Markdown + GFM をレンダリング
- **翻訳エディタ** — Lexical ベースの並列対訳。方向（日→英 / 英→日）とトーン（`business-formal` / `business-casual` / `technical` / `marketing`）を指定し、段落をホバーで対応付け。訳文はそのまま編集・コピー・入れ替えが可能
- **RAG** — クエリと文書群に対する Embeddings + Rerank で、根拠付きの関連度順結果を表示
- **Guard** — 入力テキストの安全性判定。カテゴリ別の理由提示と「別の表現を試す」回復導線を備え、威圧的でない穏やかな警告として表示
- **設定** — API キーと既定モデルをブラウザに保存・切替。API キーはセッション限定（`sessionStorage`）での保持も選択可能。テーマはシステム / ライト / ダークを切替（`prefers-color-scheme` 連携）

### アーキテクチャ

- Vite + React + TypeScript の SPA
- Tailwind CSS v4 によるスタイリング
- `react-router-dom` によるページルーティング
- `zustand` + `persist` による設定の永続化、IndexedDB による会話履歴
- Sarashina API への直接呼び出し（SSE ストリーミング対応）

### PWA / オフライン

- `vite-plugin-pwa`（Workbox, `generateSW`）でアプリシェルをプリキャッシュ
- マニフェストは日本語（`lang: "ja"`）で、通常アイコンと maskable アイコンを同梱
- ホーム画面に追加するとスタンドアロンのアプリとして起動

## インストールとビルド

### 前提条件

| ツール | 必要バージョン | 確認コマンド |
|---|---:|---|
| Node.js | >= 20 | `node --version` |
| pnpm（推奨） | >= 9 | `pnpm --version` |

Sarashina API キーは [SB Intuitions / Sarashina](https://www.sbintuitions.co.jp/) より取得してください。

### 基本的な手順

1. リポジトリを取得

```bash
git clone https://github.com/watanabe3tipapa/sarashina-mercury.git
cd sarashina-mercury
```

2. 依存をインストール

```bash
pnpm install
```

3. 開発サーバーを起動

```bash
pnpm dev
```

起動後、アプリの「設定」から API キーを登録すると各機能が利用できます。

4. 本番ビルド

```bash
pnpm build
```

ビルド結果は `dist/` に出力されます。プレビューは `pnpm preview` で確認できます。

### 主要コマンド

| コマンド | 用途 |
|---|---|
| `pnpm dev` | 開発サーバーを起動（HMR） |
| `pnpm build` | 型チェック（`tsc -b`）＋ 本番ビルド |
| `pnpm preview` | ビルド成果物をローカルでプレビュー |
| `pnpm lint` | oxlint による静的解析 |

### 公開

`main` ブランチへの push を契機に [GitHub Actions](./.github/workflows/deploy-pages.yml) がビルド・デプロイを行い、LP とアプリを GitHub Pages で公開します。

| パス | 内容 |
|---|---|
| `/` | ランディングページ（`docs/`） |
| `/app/` | アプリ本体（Vite ビルド成果物） |
| `/guide.html` | UX/UI 設計ガイド |

- アプリはサブパス配信のため、ビルド時に `BASE_PATH=/sarashina-mercury/app/` を指定します（Vite の `base` に反映）。
- ルーティングは `import.meta.env.BASE_URL` を `basename` に使い、`404.html` で SPA の直リンクをフォールバックします。
- ルート以外で配信する場合は `BASE_PATH` を変更してください。
- 公開アプリから API に到達させるには、リポジトリ変数 `SARASHINA_API_BASE` に Worker の URL（例: `https://sarashina-proxy.<your-subdomain>.workers.dev/v1`）を設定してください（`VITE_SARASHINA_API_BASE` としてビルドに注入されます）。

## セキュリティ

- API キーは `localStorage` に保存され、Sarashina API 以外へ送信されません
- サーバーを介さずブラウザから API を直接呼び出します（API 側の CORS 設定に依存）
- 公開端末での利用は避け、必要に応じてキーのローテーションを行ってください

## CORS とプロキシ（Cloudflare Worker）

Sarashina API は CORS ヘッダーを返さないため、ブラウザから直接呼び出すと応答がブロックされます。本リポジトリには、リクエストを中継するだけの薄いプロキシ（`worker/`）が含まれています。API キーはブラウザに保存され、リクエストごとに `Authorization` ヘッダーでプロキシを素通しします（プロキシはキーを保存しません）。

```bash
cd worker
pnpm install
pnpm dev      # ローカルでプロキシを起動
pnpm deploy   # Cloudflare にデプロイ
```

デプロイ後、発行された Worker の URL をアプリのビルド時に指定します。

```bash
# .env
VITE_SARASHINA_API_BASE=https://sarashina-proxy.<your-subdomain>.workers.dev/v1
```

- `pnpm dev`（アプリ）では Vite の開発プロキシが自動で使われるため、Worker は不要です。
- 本番ビルドでは `VITE_SARASHINA_API_BASE` を必ず設定してください（未設定時は Sarashina API を直接参照し、CORS で失敗します）。
- 公開時は `worker/wrangler.toml` の `ALLOWED_ORIGIN` をアプリのオリジンに限定することを推奨します。

### 既知の制約: API は日本国内からのアクセスに限定

Sarashina API は AWS WAF により、**日本国外のリージョンからのリクエストを `403 Forbidden` で拒否**します（検証済み: 東京 NRT/KIX のエッジは `401`＝認証到達、US/AU などのエッジは上流の `403`）。

Cloudflare Worker はエッジの実行リージョンにより日本国外で実行されることがあるため、その場合は `403` になります。現状の緩和策:

- `worker/wrangler.toml` の **Smart Placement**（`[placement] mode = "smart"`）でオリジン（日本）付近での実行を促しています。
- アプリ側（`src/lib/api/sarashina.ts`）で `403` / `429` を検知したら最大 3 回リトライし、エッジの実行リージョンを引き直します。

> **注意**: `*.workers.dev` は国内クライアントでも日本国外のエッジに着地することがあり、Smart Placement も best-effort のため成功率は保証されません。より確実にするには以下を検討してください。
>
> - **カスタムドメイン**を Cloudflare に接続（国内ユーザーが NRT/KIX に着地しやすくなる）
> - 日本リージョンに固定したプロキシ（Google Cloud Run `asia-northeast1`、AWS Lambda `ap-northeast-1`）

## ディレクトリ構成

```text
src/
├── App.tsx                       # ルーティング定義
├── main.tsx                      # エントリポイント
├── features/
│   ├── chat/ChatPage.tsx          # チャット（ストリーミング）
│   ├── settings/SettingsPage.tsx  # API キー / モデル / テーマ設定
│   └── tools/
│       ├── TranslatePage.tsx      # 翻訳エディタ（Lexical・トーン制御）
│       ├── RAGPage.tsx            # Rerank + Chat（引用元付き回答）
│       └── GuardPage.tsx          # 安全性判定（回復導線付き）
├── components/
│   ├── SourceCitation.tsx         # 引用元カード（関連度バー・スクロール）
│   ├── GuardNotice.tsx            # Guard の穏やかな警告（カテゴリ別理由・言い換え支援）
│   └── editor/EditorPane.tsx      # Lexical エディタ（並列対訳）
├── hooks/
│   └── useThemeSync.ts            # テーマ適用・OS 設定への追従
├── lib/
│   ├── api/sarashina.ts           # Sarashina API クライアント
│   ├── db/conversations.ts        # 会話履歴の永続化（IndexedDB）
│   ├── theme.ts                   # テーマ解決（system / light / dark）
│   ├── tokens.ts                  # トークン推定
│   └── utils.ts                   # クラス名ユーティリティ（cn）
└── store/
    ├── useChatStore.ts            # 会話一覧の状態管理（zustand）
    └── useSettingsStore.ts        # 設定の永続化（zustand）

docs/                              # ランディングページ（GitHub Pages の root）
public/                            # アイコン・manifest 用アセット
scripts/build-404.mjs              # SPA 用 404.html の生成
worker/                            # CORS 回避用 Cloudflare Worker プロキシ
├── src/index.ts                   # リクエスト中継 + CORS ヘッダー付与
└── wrangler.toml                  # Worker 設定
```

## ロードマップ

### v0.1.3（開発中）

- [x] Guard の回復導線 UI（カテゴリ別の理由提示・言い換え支援・再判定）
- [x] API キーのセッション限定保存オプション（`sessionStorage`）
- [x] ライトテーマ（`prefers-color-scheme` 連携、システム / ライト / ダーク選択）
- [x] Vitest + React Testing Library による単体テスト（API クライアント・ストア・UI）
- [ ] トークン / 料金のリアルタイム推定

### v0.1.2（リリース済み）

- [x] 翻訳エディタ（Lexical ベースの並列対訳・段落ホバー同期・訳文の直接編集）
- [x] ツールページのコード分割（Lexical を初期バンドルから分離）
- [x] ランディングページと設計ガイドのデザイン統一、ドキュメント総点検

### v0.1.1

- [x] 本番で API に到達できるよう `VITE_SARASHINA_API_BASE` を CI 変数から注入
- [x] Worker が `Accept` を転送し、SSE ストリーミングを維持
- [x] Worker の CORS を Origin 検証 + `Vary: Origin` に強化し、パスを `/v1/` に限定
- [x] Markdown 表示用のスタイルを追加（`prose` が未適用だった問題を修正）
- [x] 未使用依存の削除と軽微な構成整理

### v0.1.0

- [x] Vite + PWA セットアップ
- [x] API キー設定画面（ローカル保存）
- [x] チャット（`sarashina3-mini` / `sarashina3-nano`）＋ ストリーミング応答
- [x] 翻訳（トーン制御）
- [x] RAG（Embeddings + Rerank）
- [x] Guard（安全性判定）
- [x] 会話履歴の永続化（IndexedDB）
- [x] システムプロンプト設定
- [x] 引用元表示（SourceCitation）・根拠へのスクロール
- [x] ランディングページと GitHub Pages デプロイ

## ドキュメント

1. [UX/UI 設計ガイド](https://watanabe3tipapa.github.io/sarashina-mercury/guide.html) — モデル選定、エンドポイント別 UI パターン、デザイントークン、導入ワークフロー（ソース: [`sarashina_api_uxui_guide.html`](./sarashina_api_uxui_guide.html)）
2. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — MVP の実装計画
3. [公開サイト](https://watanabe3tipapa.github.io/sarashina-mercury/) — ランディングページとアプリ

## コントリビューション

コントリビューションは歓迎します。大きな変更を行う前に [Issue](https://github.com/watanabe3tipapa/sarashina-mercury/issues) を立てて相談してください。一般的な手順:

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/your-feature`)
3. 変更をコミット (`git commit -m 'Add your feature'`)
4. ブランチをプッシュし、Pull Request を作成

## 連絡先

- GitHub: https://github.com/watanabe3tipapa/sarashina-mercury
- 公開サイト: https://watanabe3tipapa.github.io/sarashina-mercury/

## ライセンス

MIT ライセンス — 詳細はリポジトリの [LICENSE](LICENSE) ファイルを参照してください。

「Sarashina」は SB Intuitions が提供するモデルの名称であり、本プロジェクトは同社とは無関係の非公式クライアントです。モデルおよび API の利用には SB Intuitions の規約が適用されます。
