/**
 * Asset Library Component
 * Displays grid of uploaded images with search, filtering, and management
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Upload, Trash2, Image as ImageIcon, Filter } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { getAssets, deleteAsset, getAssetCount } from '@/lib/assetStorage'
import { useImageUpload } from '@/hooks/useImageUpload'
import type { Asset, AssetFilters } from '@/types/asset'

// Draggable Asset Component
interface DraggableAssetProps {
  asset: Asset
  selectionMode: boolean
  onAssetClick: (asset: Asset) => void
  onDelete: (asset: Asset, e: React.MouseEvent) => void
}

const DraggableAsset: React.FC<DraggableAssetProps> = ({
  asset,
  selectionMode,
  onAssetClick,
  onDelete
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `asset:${asset.id}`,
    data: {
      type: 'asset',
      asset: asset
    }
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onAssetClick(asset)}
      className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
        selectionMode
          ? 'cursor-pointer hover:border-blue-500 hover:shadow-md'
          : 'cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-lg'
      } ${
        isDragging ? 'opacity-50 scale-95 shadow-2xl' : ''
      }`}
    >
      <img
        src={asset.url}
        alt={asset.filename}
        className="w-full h-full object-cover"
      />

      {/* Overlay with actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onDelete(asset, e)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors pointer-events-auto"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag hint */}
      {!selectionMode && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded shadow-lg">
            Drag to canvas
          </div>
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-xs text-white font-medium truncate">
          {asset.filename}
        </p>
        <p className="text-xs text-white/80">
          {asset.width} × {asset.height} • {asset.format.toUpperCase()}
        </p>
      </div>
    </div>
  )
}

interface AssetLibraryProps {
  onAssetSelect?: (url: string, publicId: string) => void
  selectionMode?: boolean
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onAssetSelect,
  selectionMode = false
}) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'filename'>('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [assetCount, setAssetCount] = useState(0)

  // Load assets
  const loadAssets = useCallback(async () => {
    setLoading(true)
    try {
      const filters: Partial<AssetFilters> = {
        searchQuery: searchQuery || undefined,
        format: selectedFormat.length > 0 ? selectedFormat : undefined,
        sortBy,
        sortOrder
      }

      const loadedAssets = await getAssets(filters)
      setAssets(loadedAssets)

      const count = await getAssetCount()
      setAssetCount(count)
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedFormat, sortBy, sortOrder])

  // Load assets on mount and when filters change
  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  // Handle asset upload
  const handleUploadComplete = useCallback(() => {
    loadAssets()
  }, [loadAssets])

  const { openFilePicker, fileInputRef, handleFileSelect, uploadState } = useImageUpload({
    onImageSelect: handleUploadComplete
  })

  // Handle asset deletion
  const handleDelete = async (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(`Delete "${asset.filename}"? This cannot be undone.`)) {
      return
    }

    try {
      await deleteAsset(asset.id)
      loadAssets()
    } catch (error) {
      console.error('Failed to delete asset:', error)
      alert('Failed to delete asset')
    }
  }

  // Handle asset selection
  const handleAssetClick = (asset: Asset) => {
    if (selectionMode && onAssetSelect) {
      onAssetSelect(asset.url, asset.publicId)
    }
  }

  // Toggle format filter
  const toggleFormat = (format: string) => {
    setSelectedFormat(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedFormat([])
    setSortBy('uploadedAt')
    setSortOrder('desc')
  }

  const hasActiveFilters = searchQuery || selectedFormat.length > 0 || sortBy !== 'uploadedAt' || sortOrder !== 'desc'

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Asset Library</h3>
            <p className="text-sm text-gray-500">{assetCount} image{assetCount !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openFilePicker}
            disabled={uploadState.isUploading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploadState.isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            {/* Format Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="flex flex-wrap gap-2">
                {['jpg', 'png', 'gif', 'webp'].map(format => (
                  <button
                    key={format}
                    onClick={() => toggleFormat(format)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedFormat.includes(format)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'uploadedAt' | 'filename')}
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="uploadedAt">Upload Date</option>
                  <option value="filename">Filename</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Uploading {uploadState.fileName}...
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading assets...</p>
            </div>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">No assets yet</h4>
              <p className="text-sm text-gray-500 mb-4">
                {hasActiveFilters
                  ? 'No assets match your filters'
                  : 'Upload images to get started'}
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={openFilePicker}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Upload Image
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {assets.map(asset => (
              <DraggableAsset
                key={asset.id}
                asset={asset}
                selectionMode={selectionMode}
                onAssetClick={handleAssetClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selection Mode Footer */}
      {selectionMode && assets.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Click an image to use it
          </p>
        </div>
      )}
    </div>
  )
}
