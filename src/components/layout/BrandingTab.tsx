/**
 * Branding Tab Component
 * Centralized brand management hub for colors and styles
 */

import { useState, useEffect } from 'react'
import { Plus, Palette, Sparkles, RotateCcw } from 'lucide-react'
import { useEmailStore } from '@/stores/emailStore'
import ColorSwatchCard from '@/components/ui/ColorSwatchCard'
import TypographyStyleCard from '@/components/ui/TypographyStyleCard'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors, findUnbrandedColors, generateColorName } from '@/lib/utils/colorUtils'

export default function BrandingTab() {
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const typographyStyles = useEmailStore((state) => state.email.settings.typographyStyles)
  const blocks = useEmailStore((state) => state.email.blocks)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const updateBrandColorName = useEmailStore((state) => state.updateBrandColorName)
  const updateTypographyStyle = useEmailStore((state) => state.updateTypographyStyle)
  const applyTypographyStyleToAll = useEmailStore((state) => state.applyTypographyStyleToAll)
  const resetTypographyStyles = useEmailStore((state) => state.resetTypographyStyles)

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [newColor, setNewColor] = useState('#3B82F6')

  // Auto-initialize typography styles if they don't exist (for existing emails created before this feature)
  useEffect(() => {
    if (!typographyStyles || typographyStyles.length === 0) {
      resetTypographyStyles()
    }
  }, []) // Run only once on mount

  // Count usage of each brand color
  const getColorUsageCount = (color: string): number => {
    let count = 0

    const countInBlock = (block: any): void => {
      // Check common styles
      if (block.styles?.backgroundColor?.toUpperCase() === color.toUpperCase()) count++

      // Check block-specific colors
      switch (block.type) {
        case 'heading':
        case 'text':
          if (block.data.color?.toUpperCase() === color.toUpperCase()) count++
          break
        case 'button':
          if (block.data.backgroundColor?.toUpperCase() === color.toUpperCase()) count++
          if (block.data.textColor?.toUpperCase() === color.toUpperCase()) count++
          break
        case 'divider':
          if (block.data.color?.toUpperCase() === color.toUpperCase()) count++
          break
        case 'footer':
          if (block.data.backgroundColor?.toUpperCase() === color.toUpperCase()) count++
          if (block.data.textColor?.toUpperCase() === color.toUpperCase()) count++
          if (block.data.linkColor?.toUpperCase() === color.toUpperCase()) count++
          break
        case 'layout':
          block.data.children?.forEach(countInBlock)
          break
      }
    }

    blocks.forEach(countInBlock)
    return count
  }

  // Extract colors from current email
  const handleExtractColors = () => {
    const unbrandedColors = findUnbrandedColors(blocks, brandColors)

    if (unbrandedColors.length === 0) {
      alert('No new colors found in your email. All colors are already in your brand kit!')
      return
    }

    const confirmMessage = `Found ${unbrandedColors.length} color${unbrandedColors.length > 1 ? 's' : ''} in your email:\n${unbrandedColors.join(', ')}\n\nAdd ${unbrandedColors.length > 1 ? 'them' : 'it'} to your brand kit?`

    if (confirm(confirmMessage)) {
      unbrandedColors.forEach((color) => {
        const name = generateColorName(color)
        addBrandColor(color, name)
      })
    }
  }

  // Add new color
  const handleAddColor = () => {
    const suggestedName = generateColorName(newColor)
    addBrandColor(newColor, suggestedName)
    setShowColorPicker(false)
    setNewColor('#3B82F6')
  }

  // Sort brand colors by order
  const sortedBrandColors = [...brandColors].sort((a, b) => a.order - b.order)

  // Count heading and text blocks for typography styles
  const countHeadingBlocks = (): number => {
    return blocks.filter((block) => block.type === 'heading').length
  }

  const countTextBlocks = (): number => {
    return blocks.filter((block) => block.type === 'text').length
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Brand Management</h3>
        <p className="text-xs text-gray-500 mt-1">
          Define and apply your brand colors consistently
        </p>
      </div>

      {/* Brand Colors Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Brand Colors</h4>
          <div className="flex gap-2">
            {/* Extract Colors Button */}
            {blocks.length > 0 && (
              <button
                onClick={handleExtractColors}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
                title="Extract colors from current email"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Extract
              </button>
            )}

            {/* Add Color Button */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Color
            </button>
          </div>
        </div>

        {/* Add Color Picker */}
        {showColorPicker && (
          <div className="mb-3 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Pick a color
                </label>
                <ColorThemePicker
                  value={newColor}
                  onChange={setNewColor}
                  brandColors={sortedBrandColors}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddColor}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Brand Color List */}
        {sortedBrandColors.length > 0 ? (
          <div className="space-y-2">
            {sortedBrandColors.map((brandColor) => (
              <ColorSwatchCard
                key={brandColor.color}
                brandColor={brandColor}
                usageCount={getColorUsageCount(brandColor.color)}
                onUpdateName={updateBrandColorName}
                onRemove={removeBrandColor}
                isDraggable={false} // TODO: Add drag-and-drop reordering in future
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <Palette className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              No brand colors yet
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Add your brand colors to maintain consistency across all emails
            </p>
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => setShowColorPicker(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Color
              </button>
              {blocks.length > 0 && (
                <button
                  onClick={handleExtractColors}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Extract from Current Email
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Typography Styles Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Typography Styles</h4>
          <button
            onClick={() => {
              if (confirm('Reset typography styles to defaults?')) {
                resetTypographyStyles()
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
            title="Reset to default styles"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="space-y-3">
          {(typographyStyles || []).map((style) => (
            <TypographyStyleCard
              key={style.name}
              style={style}
              brandColors={sortedBrandColors}
              onUpdate={updateTypographyStyle}
              onApplyToAll={applyTypographyStyleToAll}
              blockCount={style.name === 'heading' ? countHeadingBlocks() : countTextBlocks()}
            />
          ))}
        </div>

        {(!typographyStyles || typographyStyles.length === 0) && (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              Typography styles help maintain consistent text formatting across your emails
            </p>
          </div>
        )}
      </div>

      {/* Link to manage in Color Picker */}
      {sortedBrandColors.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <span className="mr-1">💡</span>
            Brand colors appear in all color pickers throughout the app
          </p>
        </div>
      )}
    </div>
  )
}
