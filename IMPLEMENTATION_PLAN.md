# Sarashina Mercury - Implementation Plan

## 概要

Mercury Editor を参考にした、Sarashina 専用の PWA ツール。
ユーザーが自身の Sarashina API キーを持ち、ブラウザ上で Sarashina を自由に利用できる。

## 目標

- PWA 対応（オフライン + インストール可能）
- Sarashina API を活用したチャット UI
- ガイドに基づいた UX/UI

## 技術構成

- Vite + React + TypeScript
- Tailwind CSS v4（スタイリング）
- PWA: vite-plugin-pwa + Workbox
- ルーティング: react-router-dom
- 状態管理: zustand（+ persist）
- HTTP: fetch（SSE ストリーミング対応）
- ストレージ: localStorage（API キー）、IndexedDB（会話履歴）
- AI: Sarashina API をブラウザから直接呼び出し（SDK 非依存）
- マークダウン: react-markdown + remark-gfm
- アイコン: lucide-react
- CORS 回避: Cloudflare Worker プロキシ
- 公開: GitHub Pages（LP + アプリ、GitHub Actions でビルド・デプロイ）

## MVP 機能

- [x] PWA セットアップ（manifest / Service Worker / アイコン）
- [x] API キー設定画面（ローカル保存）
- [x] チャット画面（`sarashina3-mini` / `sarashina3-nano`）
- [x] ストリーミング応答
- [x] 会話履歴（IndexedDB）
- [x] システムプロンプト設定

## v0.1.2（ガイド準拠）

- [x] トーン制御（翻訳時）
- [x] RAG（Rerank + Chat + 根拠表示）
- [x] Guard 判定の表示
- [x] サイドバー UI（チャット・ツール切替）
- [x] 翻訳エディタ（Lexical 並列対訳・段落ホバー同期）
- [x] ツールページのコード分割（Lexical を初期バンドルから分離）
- [x] Guard 警告 UI（回復導線の強化）

## v0.1.3（予定）

- [ ] トークン / 料金のリアルタイム推定
- [ ] カスタムドメイン / 日本リージョン固定プロキシによる CORS 安定化

## コードレビュー指摘への対応

- [x] `useChatStore` の `initStarted` をモジュールスコープ変数からストア状態 `initialized` へ移行
- [x] RAG の引用置換を Markdown リンク（`[n](url)`・`[text][n]`）と衝突しない正規表現に修正
- [x] `postJSON` のエラー本文を JSON 優先で解析（可読性向上）、SSE 解析失敗を dev 時のみ警告
- [x] 表記統一（`APIキー`→`API キー`、`Sarashina AI`→`Sarashina`、`営み`→`機能`）
- [x] Vitest + React Testing Library を導入（API クライアント・トークン推定・Guard 通知 UI・設定ストアの単体テスト、`pnpm test`）
- [x] API キーのセッション限定保存オプション（`sessionStorage` 切替トグル、ストアの選択的永続化）
- [x] ライトテーマ（`prefers-color-scheme` 連携、設定でシステム / ライト / ダークを選択）

> 注: レビューの「緊急」項目（存在しない依存バージョン・`main.tsx` の構文エラー・`index.html` の title 欠落）はいずれも実際には該当しない（依存は全て実在し、ビルド・lint も成功。`main.tsx` と `index.html` は正しい）。レビュアーの環境情報が古いことによる誤検出のため、コード変更は行っていない。

## v0.1.1（総点検の修正）

- [x] 本番ビルドへ `VITE_SARASHINA_API_BASE` を CI 変数（`SARASHINA_API_BASE`）から注入
- [x] Worker が `Accept` を転送し、SSE ストリーミングを維持
- [x] Worker の CORS を Origin 検証 + `Vary: Origin` に強化、パスを `/v1/` に限定
- [x] Markdown 表示スタイルを追加（`prose` 未適用の修正）
- [x] 未使用依存の削除（`class-variance-authority` / `react-syntax-highlighter` / `workbox-window` ほか）

## v0.1.0 時点の成果物

- アプリ（PWA）: チャット / 翻訳 / RAG / Guard / 設定
- ランディングページ（`docs/`）
- GitHub Pages デプロイ（GitHub Actions）

## ディレクトリ構成

```text
src/
├── App.tsx (ルーティング)
├── components/ (共通)
├── features/
│   ├── chat/
│   ├── settings/
│   └── tools/
├── lib/
│   ├── api/sarashina.ts (API クライアント)
│   └── db/ (IndexedDB)
└── store/ (zustand)
docs/        (ランディングページ)
worker/      (CORS 回避用 Cloudflare Worker)
scripts/     (ビルド補助)
```

## 実装順序

1. Vite + PWA 初期化
2. UI 基盤（Tailwind CSS）
3. API キー管理
4. チャット（ストリーミング）
5. PWA マニフェスト・Service Worker・アイコン
6. 動作確認
7. 拡張機能（翻訳・RAG・Guard）
8. LP と GitHub Pages 公開

## リスク

- Sarashina API のエンドポイント仕様確認
- ストリーミング SSE 形式の解析
- CORS（ブラウザ直接呼出）と日本国外エッジの 403
