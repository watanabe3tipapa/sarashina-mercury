/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SARASHINA_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
