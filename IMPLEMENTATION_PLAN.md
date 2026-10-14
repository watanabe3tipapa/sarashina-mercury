# Sarashina Mercury - Implementation Plan

## 概要

Mercury Editor を参考にした、Sarashina AI 専用の PWA ツール。
ユーザーが自身の Sarashina API キーを持ち、ブラウザ上で Sarashina AI を自由に利用できる。

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

## v1.1（ガイド準拠）

- [x] トーン制御（翻訳時）
- [x] RAG（Rerank + Chat + 根拠表示）
- [x] Guard 判定の表示
- [x] サイドバー UI（チャット・ツール切替）
- [ ] Guard 警告 UI（回復導線の強化）
- [ ] 翻訳エディタ（lexical ベースの編集体験）

## v1.2（予定）

- [ ] トークン / 料金のリアルタイム推定
- [ ] カスタムドメイン / 日本リージョン固定プロキシによる CORS 安定化

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
