/**
 * Image Block Controls
 * Properties specific to image blocks
 */

import { useState, useRef } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, ImageBlockData } from '@/types/email'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary'

interface ImageControlsProps {
  block: EmailBlock & { data: ImageBlockData }
}

export default function ImageControls({ block }: ImageControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const data = block.data as ImageBlockData
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDataChange = (field: keyof ImageBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const result = await uploadImageToCloudinary(file)
      handleDataChange('src', result.secure_url)

      // Auto-set alt text from filename if empty
      if (!data.alt) {
        handleDataChange('alt', file.name.replace(/\.[^/.]+$/, ''))
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Image
            </>
          )}
        </button>
        {uploadError && (
          <p className="text-xs text-red-600 mt-1">{uploadError}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL (or upload above)
        </label>
        <input
          type="url"
          value={data.src}
          onChange={(e) => handleDataChange('src', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text (for accessibility)
        </label>
        <input
          type="text"
          value={data.alt}
          onChange={(e) => handleDataChange('alt', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="Description of the image"
        />
      </div>

      {/* Image Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Width (px) - Leave empty for full width
        </label>
        <input
          type="number"
          value={data.width || ''}
          onChange={(e) => handleDataChange('width', e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="Auto"
          min="50"
          max="600"
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => handleDataChange('alignment', align)}
              className={`flex-1 px-3 py-2 text-sm border rounded-md transition-colors capitalize ${
                data.alignment === align
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Radius (px)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="50"
            value={data.borderRadius}
            onChange={(e) => handleDataChange('borderRadius', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={data.borderRadius}
            onChange={(e) => handleDataChange('borderRadius', parseInt(e.target.value))}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="0"
            max="50"
          />
        </div>
      </div>

      {/* Link URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link URL (optional)
        </label>
        <input
          type="url"
          value={data.linkUrl || ''}
          onChange={(e) => handleDataChange('linkUrl', e.target.value || null)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>
    </div>
  )
}
