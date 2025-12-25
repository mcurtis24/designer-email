/**
 * Color Swatch Card Component
 * Displays a brand color with edit and delete functionality
 */

import { useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import type { BrandColor } from '@/types/email'

interface ColorSwatchCardProps {
  brandColor: BrandColor
  usageCount?: number
  onUpdateName: (color: string, name: string) => void
  onRemove: (color: string) => void
  onApply?: (color: string) => void
  isDraggable?: boolean
}

export default function ColorSwatchCard({
  brandColor,
  usageCount,
  onUpdateName,
  onRemove,
  onApply,
  isDraggable = false,
}: ColorSwatchCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(brandColor.name || '')

  const handleNameSave = () => {
    if (editedName.trim()) {
      onUpdateName(brandColor.color, editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setEditedName(brandColor.name || '')
      setIsEditingName(false)
    }
  }

  return (
    <div className="group flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors bg-white">
      {/* Drag Handle */}
      {isDraggable && (
        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Color Swatch */}
      <div
        className="w-10 h-10 rounded-md border-2 border-gray-200 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: brandColor.color }}
        onClick={() => onApply?.(brandColor.color)}
        title={onApply ? 'Click to apply color' : brandColor.color}
      />

      {/* Color Info */}
      <div className="flex-1 min-w-0">
        {/* Color Name (editable) */}
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            className="w-full px-2 py-1 text-sm font-medium text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            placeholder="Color name"
          />
        ) : (
          <div
            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
            onClick={() => setIsEditingName(true)}
            title="Click to edit name"
          >
            {brandColor.name || 'Unnamed Color'}
          </div>
        )}

        {/* Hex Code */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 font-mono">{brandColor.color}</span>
          {usageCount !== undefined && usageCount > 0 && (
            <span className="text-xs text-gray-400">• Used {usageCount}x</span>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => {
          if (
            confirm(
              `Remove "${brandColor.name || brandColor.color}" from brand colors?${
                usageCount && usageCount > 0 ? ` It's currently used in ${usageCount} place${usageCount > 1 ? 's' : ''}.` : ''
              }`
            )
          ) {
            onRemove(brandColor.color)
          }
        }}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
        title="Remove color"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
