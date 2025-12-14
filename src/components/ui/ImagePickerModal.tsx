/**
 * Image Picker Modal
 * Modal component for selecting images from library or uploading new ones
 */

import React, { useState } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { AssetLibrary } from '@/components/layout/AssetLibrary'
import { useImageUpload } from '@/hooks/useImageUpload'

interface ImagePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (url: string, publicId?: string) => void
  title?: string
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  title = 'Select Image'
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')

  // Handle upload from upload tab
  const handleUploadComplete = (url: string, publicId?: string) => {
    onImageSelect(url, publicId)
    onClose()
  }

  const { openFilePicker, fileInputRef, handleFileSelect, uploadState } = useImageUpload({
    onImageSelect: handleUploadComplete
  })

  // Handle selection from library
  const handleLibrarySelect = (url: string, publicId: string) => {
    onImageSelect(url, publicId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Asset Library
              </div>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload New
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'library' ? (
            <AssetLibrary
              onAssetSelect={handleLibrarySelect}
              selectionMode={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload an Image
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose an image from your computer to upload to Cloudinary.
                  Maximum file size: 10MB
                </p>

                {uploadState.isUploading ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-blue-900">
                      Uploading {uploadState.fileName}...
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {uploadState.progress}%
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={openFilePicker}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Choose File
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: JPEG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
