/**
 * Common Controls
 * Properties shared by all block types (Padding, Background, Alignment)
 */

import { useState, useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

interface CommonControlsProps {
  block: EmailBlock
}

export default function CommonControls({ block }: CommonControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  const padding = block.styles.padding || { top: '16px', right: '16px', bottom: '16px', left: '16px' }

  // Check if all padding values are the same (linked)
  const allPaddingSame = padding.top === padding.right && padding.right === padding.bottom && padding.bottom === padding.left
  const [isLinked, setIsLinked] = useState(allPaddingSame)

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    if (isLinked) {
      // Update all sides when linked
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          padding: {
            top: `${value}px`,
            right: `${value}px`,
            bottom: `${value}px`,
            left: `${value}px`,
          },
        },
      })
    } else {
      // Update only the specified side when unlinked
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          padding: {
            ...padding,
            [side]: `${value}px`,
          },
        },
      })
    }
  }

  const toggleLink = () => {
    if (!isLinked) {
      // When linking, set all to the top value
      const topValue = parseInt(padding.top)
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          padding: {
            top: `${topValue}px`,
            right: `${topValue}px`,
            bottom: `${topValue}px`,
            left: `${topValue}px`,
          },
        },
      })
    }
    setIsLinked(!isLinked)
  }

  const handleBackgroundChange = (color: string) => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        backgroundColor: color,
      },
    })
  }

  return (
    <div className="space-y-3 pt-3 border-t border-gray-200">
      {/* Padding Controls */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700">
            Padding (px)
          </label>
          <button
            onClick={toggleLink}
            className={`p-1 rounded transition-colors ${
              isLinked
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={isLinked ? 'Unlink sides' : 'Link all sides'}
          >
            {isLinked ? (
              // Linked icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            ) : (
              // Unlinked icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1M6 18h.01M10 14h.01" />
              </svg>
            )}
          </button>
        </div>

        {isLinked ? (
          // Linked mode: Single slider
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="80"
              step="2"
              value={parseInt(padding.top)}
              onChange={(e) => handlePaddingChange('top', e.target.value)}
              className="flex-1"
            />
            <input
              type="number"
              value={parseInt(padding.top)}
              onChange={(e) => handlePaddingChange('top', e.target.value)}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
              min="0"
              max="80"
            />
          </div>
        ) : (
          // Unlinked mode: Individual inputs
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                value={parseInt(padding.top)}
                onChange={(e) => handlePaddingChange('top', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="Top"
                min="0"
              />
              <span className="text-xs text-gray-500">Top</span>
            </div>
            <div>
              <input
                type="number"
                value={parseInt(padding.right)}
                onChange={(e) => handlePaddingChange('right', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="Right"
                min="0"
              />
              <span className="text-xs text-gray-500">Right</span>
            </div>
            <div>
              <input
                type="number"
                value={parseInt(padding.bottom)}
                onChange={(e) => handlePaddingChange('bottom', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="Bottom"
                min="0"
              />
              <span className="text-xs text-gray-500">Bottom</span>
            </div>
            <div>
              <input
                type="number"
                value={parseInt(padding.left)}
                onChange={(e) => handlePaddingChange('left', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="Left"
                min="0"
              />
              <span className="text-xs text-gray-500">Left</span>
            </div>
          </div>
        )}
      </div>

      {/* Background Color (for non-text blocks) */}
      {block.type !== 'heading' && block.type !== 'text' && (
        <ColorThemePicker
          label="Background Color"
          value={block.styles.backgroundColor || '#ffffff'}
          onChange={handleBackgroundChange}
          documentColors={documentColors}
          brandColors={brandColors}
          onAddBrandColor={addBrandColor}
          onRemoveBrandColor={removeBrandColor}
        />
      )}
    </div>
  )
}
