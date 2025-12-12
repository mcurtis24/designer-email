/**
 * Application Configuration
 * Environment variables and API configuration
 */

export const config = {
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  },
  resend: {
    apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
    fromEmail: import.meta.env.VITE_RESEND_FROM_EMAIL || '',
  },
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(config.cloudinary.cloudName && config.cloudinary.uploadPreset)
}

export function isResendConfigured(): boolean {
  return Boolean(config.resend.apiKey && config.resend.fromEmail)
}
