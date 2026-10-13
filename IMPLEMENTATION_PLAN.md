# Sarashina Mercury - Implementation Plan

## 概要
Mercury Editorを参考にした、Sarashina AI専用のPWAツール。
ユーザーが自身のGoogle Cloud/Sarashina APIキーを持ち、ブラウザ上でSarashina AIを自由に利用できる。

## 目標
- PWA対応（オフライン + インストール可能）
- Sarashina APIを活用したチャットUI
- ガイドに基づいたUX/UI

## 技術構成
- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS
- PWA: vite-plugin-pwa + Workbox
- ルーティング: react-router-dom
- 状態管理: zustand
- HTTP: fetch（ストリーミング対応）
- ストレージ: localStorage（APIキー）、IndexedDB（会話履歴等）
- AI: @openrouter/ai-sdk? ではなくSarashina API直接呼び出し
- マークダウン: react-markdown + remark-gfm
- エディタ拡張: lexical（mercury参考）

## MVP機能
- [ ] PWAセットアップ
- [ ] APIキー設定画面（ローカル保存）
- [ ] チャット画面（sarashina3-mini/nano）
- [ ] ストリーミング応答
- [x] 会話履歴
- [x] システムプロンプト設定

## v1.1（ガイド準拠）
- [ ] トーン制御（翻訳時）
- [ ] Guard警告UI
- [x] RAG（Rerank + Chat + 根拠表示）
- [ ] 翻訳エディタ
- [ ] サイドバーUI（チャット・ツール切替）

## ディレクトリ構成
src/
├── app/ (ルーティング・レイアウト)
├── components/ (共通・shadcn)
├── features/
│   ├── chat/
│   ├── settings/
│   └── tools/
├── lib/
│   ├── api/sarashina.ts (APIクライアント)
│   ├── store/
│   └── utils/
└── hooks/

## 実装順序
1. Vite + PWA初期化
2. UI基盤（shadcn/ui）
3. APIキー管理
4. チャット（ストリーミング）
5. PWAマニフェスト・sw
6. 動作確認
7. 拡張機能

## リスク
- Sarashina APIのエンドポイント仕様確認
- ストリーミングSSE形式の解析
- CORS（ブラウザ直接呼出）
