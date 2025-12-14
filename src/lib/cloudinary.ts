/**
 * Cloudinary Image Upload
 * Handles image uploads to Cloudinary
 */

import { config, isCloudinaryConfigured } from './config'
import { addAsset } from './assetStorage'
import type { Asset } from '@/types/asset'

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
}

/**
 * Upload image to Cloudinary and save to asset library
 */
export async function uploadImageToCloudinary(
  file: File,
  saveToLibrary = true
): Promise<CloudinaryUploadResponse> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', config.cloudinary.uploadPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Save to asset library
    if (saveToLibrary) {
      const asset: Asset = {
        id: data.public_id,
        url: data.secure_url,
        publicId: data.public_id,
        filename: file.name,
        uploadedAt: Date.now(),
        width: data.width,
        height: data.height,
        format: data.format,
        size: file.size,
        tags: [],
        folder: undefined
      }

      try {
        await addAsset(asset)
      } catch (error) {
        console.error('Failed to save asset to library:', error)
        // Don't throw - upload was successful even if saving to library failed
      }
    }

    return data
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' }
  }

  return { valid: true }
}
