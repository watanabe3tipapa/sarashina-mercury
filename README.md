# sarashina-mercury

**Sarashina を、あなたの手元で。API キーひとつで動く国産 LLM の PWA クライアント。**

sarashina-mercury は、SB Intuitions の国産大規模言語モデル「Sarashina」をブラウザから直接利用できる PWA です。ユーザー自身の Sarashina API キーをローカル（ブラウザ）に保存し、チャット・翻訳・RAG・Guard の各機能を、オフラインでもインストール可能な単一アプリとして提供します。編集体験は Mercury Editor を参考にしています。

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![GitHub issues](https://img.shields.io/github/issues/watanabe3tipapa/sarashina-mercury)](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

**クイックリンク:** [UX/UI 設計ガイド](./sarashina_api_uxui_guide.html) · [実装計画](./IMPLEMENTATION_PLAN.md) · [Issues](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

## コンセプト

### なぜ「Mercury」なのか

Sarashina API は「日本語らしさ」を体現するモデルです。婉曲表現・省略・文脈推論といった日本語の豊かさを、単なる機能の羅列ではなく編集体験として昇華させる――その手本とするのが Mercury Editor です。sarashina-mercury は、API キーをサーバーに預けず、ブラウザと Sarashina API だけを直接つなぐことで、データ主権を保ったまま快適な PWA を目指します。

| 営み | sarashina-mercury の対応物 |
| --- | --- |
| 対話する | `sarashina3-mini` / `sarashina3-nano` によるストリーミングチャット |
| 翻訳する | `sarashina3-translate` によるトーン指定翻訳 |
| 根拠を探す | `sarashina3-embedding` + `sarashina3-rerank` による RAG |
| 安全を確かめる | `sarashina3-guard` による入出力の安全性判定 |
| オフラインで使う | `vite-plugin-pwa` + Workbox によるインストール可能な PWA |
| 鍵を持ち歩く | API キーは `localStorage` にのみ保存（サーバー送信なし） |

### 対応モデル

| モデル ID | コンテキスト | 主な用途 | API カテゴリ |
| --- | --- | --- | --- |
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
- **翻訳** — 方向（日→英 / 英→日）とトーン（`business-formal` / `business-casual` / `technical` / `marketing`）を指定した翻訳
- **RAG** — クエリと文書群に対する Embeddings + Rerank で、根拠付きの関連度順結果を表示
- **Guard** — 入力テキストの安全性判定結果を表示
- **設定** — API キーと既定モデルをブラウザに保存・切替

### アーキテクチャ

- Vite + React + TypeScript の SPA
- Tailwind CSS v4 によるスタイリング
- `react-router-dom` によるページルーティング
- `zustand` + `persist` による設定の永続化
- Sarashina API への直接呼び出し（SSE ストリーミング対応）

## インストールとビルド

### 前提条件

| ツール | 必要バージョン | 確認コマンド |
| --- | --- | --- |
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
| --- | --- |
| `pnpm dev` | 開発サーバーを起動（HMR） |
| `pnpm build` | 型チェック（`tsc -b`）＋ 本番ビルド |
| `pnpm preview` | ビルド成果物をローカルでプレビュー |
| `pnpm lint` | oxlint による静的解析 |

## ディレクトリ構成

```text
src/
├── App.tsx                     # ルーティング定義
├── main.tsx                    # エントリポイント
├── features/
│   ├── chat/ChatPage.tsx        # チャット（ストリーミング）
│   ├── settings/SettingsPage.tsx # API キー / モデル設定
│   └── tools/
│       ├── TranslatePage.tsx    # 翻訳（トーン制御）
│       ├── RAGPage.tsx          # Embeddings + Rerank
│       └── GuardPage.tsx        # 安全性判定
├── lib/api/sarashina.ts        # Sarashina API クライアント
├── store/useSettingsStore.ts   # 設定の永続化（zustand）
└── lib/utils.ts                # クラス名ユーティリティ（cn）
```

## セキュリティ

- API キーは `localStorage` に保存され、Sarashina API 以外へ送信されません
- サーバーを介さずブラウザから API を直接呼び出します（API 側の CORS 設定に依存）
- 公開端末での利用は避け、必要に応じてキーのローテーションを行ってください

## ロードマップ

- [x] Vite + PWA セットアップ
- [x] API キー設定画面（ローカル保存）
- [x] チャット（`sarashina3-mini` / `sarashina3-nano`）＋ ストリーミング応答
- [x] 翻訳（トーン制御）
- [x] RAG（Embeddings + Rerank）
- [x] Guard（安全性判定）
- [ ] 会話履歴の永続化（IndexedDB）
- [ ] システムプロンプト設定
- [ ] 引用元表示（SourceCitation）・根拠へのスクロール
- [ ] トークン / 料金のリアルタイム推定

## ドキュメント

- [Sarashina API を活用した UX/UI 設計・実装手法](./sarashina_api_uxui_guide.html) — モデル選定、エンドポイント別 UI パターン、デザイントークン、導入ワークフロー
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — MVP と v1.1 の実装計画

## コントリビューション

コントリビューションは歓迎します。大きな変更を行う前に [Issue](https://github.com/watanabe3tipapa/sarashina-mercury/issues) を立てて相談してください。一般的な手順:

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/your-feature`)
3. 変更をコミット (`git commit -m 'Add your feature'`)
4. ブランチをプッシュし、Pull Request を作成

## 連絡先

- GitHub: [https://github.com/watanabe3tipapa/sarashina-mercury](https://github.com/watanabe3tipapa/sarashina-mercury)
- Issues: [https://github.com/watanabe3tipapa/sarashina-mercury/issues](https://github.com/watanabe3tipapa/sarashina-mercury/issues)

## ライセンス

本リポジトリは現時点でライセンスを明示していません。ライセンスの追加を希望する場合は Issue にてご相談ください。
