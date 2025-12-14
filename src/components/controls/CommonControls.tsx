/**
 * Common Controls
 * Properties shared by all block types (Padding, Background, Alignment)
 */

import { useState, useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, SpacingValue } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

type DesignMode = 'desktop' | 'mobile'

// Validate CSS color values
function isValidColor(color: string): boolean {
  if (!color) return false

  // Check hex colors
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) return true

  // Check rgb/rgba
  if (/^rgba?\([\d\s,]+\)$/.test(color)) return true

  // Check named colors (basic set)
  const namedColors = ['transparent', 'white', 'black', 'red', 'blue', 'green', 'yellow']
  if (namedColors.includes(color.toLowerCase())) return true

  return false
}

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

  // Design mode toggle (desktop/mobile controls)
  const [designMode, setDesignMode] = useState<DesignMode>('desktop')

  // Determine which padding to show based on design mode
  const basePadding = block.styles.padding || { top: '16px', right: '16px', bottom: '16px', left: '16px' }
  const mobilePadding = block.styles.mobileStyles?.padding
  const padding = designMode === 'mobile' && mobilePadding ? mobilePadding : basePadding

  // Check if all padding values are the same (linked)
  const allPaddingSame = padding.top === padding.right && padding.right === padding.bottom && padding.bottom === padding.left
  const [isLinked, setIsLinked] = useState(allPaddingSame)

  // Check if mobile overrides exist
  const hasMobilePaddingOverride = !!block.styles.mobileStyles?.padding
  const hasMobileTextAlignOverride = !!block.styles.mobileStyles?.textAlign
  const hasMobileBgColorOverride = !!block.styles.mobileStyles?.backgroundColor

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const newPadding: SpacingValue = isLinked
      ? {
          top: `${value}px`,
          right: `${value}px`,
          bottom: `${value}px`,
          left: `${value}px`,
        }
      : {
          ...padding,
          [side]: `${value}px`,
        }

    if (designMode === 'mobile') {
      // Update mobile-specific padding
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          mobileStyles: {
            ...block.styles.mobileStyles,
            padding: newPadding,
          },
        },
      })
    } else {
      // Update desktop padding
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          padding: newPadding,
        },
      })
    }
  }

  const clearMobilePaddingOverride = () => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        mobileStyles: {
          ...block.styles.mobileStyles,
          padding: undefined,
        },
      },
    })
    setDesignMode('desktop')
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
    // Validate color before applying
    if (!isValidColor(color)) {
      console.warn('Invalid color value:', color)
      return
    }

    if (designMode === 'mobile') {
      // Update mobile-specific background
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          mobileStyles: {
            ...block.styles.mobileStyles,
            backgroundColor: color,
          },
        },
      })
    } else {
      // Update desktop background
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          backgroundColor: color,
        },
      })
    }
  }

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    if (designMode === 'mobile') {
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          mobileStyles: {
            ...block.styles.mobileStyles,
            textAlign: align,
          },
        },
      })
    } else {
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          textAlign: align,
        },
      })
    }
  }

  const handleHideOnMobileChange = (hide: boolean) => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        hideOnMobile: hide,
      },
    })
  }

  const handleHideOnDesktopChange = (hide: boolean) => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        hideOnDesktop: hide,
      },
    })
  }

  return (
    <div className="space-y-3 pt-3 border-t border-gray-200">
      {/* Desktop/Mobile Design Mode Toggle */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-2 block">
          Design Mode
        </label>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setDesignMode('desktop')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              designMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🖥️ Desktop
          </button>
          <button
            onClick={() => setDesignMode('mobile')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              designMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📱 Mobile
            {(hasMobilePaddingOverride || hasMobileTextAlignOverride || hasMobileBgColorOverride) && (
              <span className="ml-1 inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>
        {designMode === 'mobile' && (
          <p className="text-xs text-gray-500 mt-1">
            Override desktop styles for mobile devices
          </p>
        )}
      </div>

      {/* Visibility Controls */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700 block">
          Visibility
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.styles.hideOnMobile || false}
            onChange={(e) => handleHideOnMobileChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Hide on Mobile</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.styles.hideOnDesktop || false}
            onChange={(e) => handleHideOnDesktopChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Hide on Desktop</span>
        </label>
      </div>

      {/* Padding Controls */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">
              Padding (px)
            </label>
            {designMode === 'mobile' && hasMobilePaddingOverride && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                📱 Override
                <button
                  onClick={clearMobilePaddingOverride}
                  className="hover:text-blue-900"
                  title="Clear mobile override"
                >
                  ×
                </button>
              </span>
            )}
          </div>
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
