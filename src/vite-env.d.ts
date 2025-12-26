/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_RESEND_API_KEY: string
  readonly VITE_RESEND_FROM_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
