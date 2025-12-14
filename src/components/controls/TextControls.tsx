/**
 * Text Block Controls
 * Properties specific to text blocks
 */

import { useMemo, useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, TextBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

type DesignMode = 'desktop' | 'mobile'

interface TextControlsProps {
  block: EmailBlock & { data: TextBlockData }
}

export default function TextControls({ block }: TextControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const data = block.data as TextBlockData

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  // Design mode toggle (desktop/mobile)
  const [designMode, setDesignMode] = useState<DesignMode>('desktop')

  // Check if mobile overrides exist
  const hasMobileFontSize = !!data.mobileFontSize
  const hasMobileLineHeight = !!data.mobileLineHeight

  const handleDataChange = (field: keyof TextBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  const clearMobileFontSize = () => {
    updateBlock(block.id, {
      data: {
        ...data,
        mobileFontSize: undefined,
      },
    })
    setDesignMode('desktop')
  }

  const clearMobileLineHeight = () => {
    updateBlock(block.id, {
      data: {
        ...data,
        mobileLineHeight: undefined,
      },
    })
    setDesignMode('desktop')
  }

  const handleBackgroundChange = (color: string) => {
    if (designMode === 'mobile') {
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
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          backgroundColor: color,
        },
      })
    }
  }

  const clearMobileBackgroundColor = () => {
    const { mobileStyles, ...otherStyles } = block.styles
    const { backgroundColor, ...otherMobileStyles } = mobileStyles || {}

    updateBlock(block.id, {
      styles: {
        ...otherStyles,
        ...(Object.keys(otherMobileStyles).length > 0 ? { mobileStyles: otherMobileStyles } : {}),
      },
    })
    setDesignMode('desktop')
  }

  const hasMobileBackgroundColor = !!block.styles.mobileStyles?.backgroundColor

  return (
    <div className="space-y-4">
      {/* Text Color */}
      <ColorThemePicker
        label="Text Color"
        value={data.color}
        onChange={(color) => handleDataChange('color', color)}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Background Color - Desktop/Mobile Mode Toggle */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Background Color
          </label>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setDesignMode('desktop')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                designMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setDesignMode('mobile')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                designMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mobile {hasMobileBackgroundColor && <span className="ml-1 w-1.5 h-1.5 bg-blue-600 rounded-full inline-block"></span>}
            </button>
          </div>
        </div>

        <ColorThemePicker
          label=""
          value={
            designMode === 'mobile' && block.styles.mobileStyles?.backgroundColor
              ? block.styles.mobileStyles.backgroundColor
              : block.styles.backgroundColor || '#ffffff'
          }
          onChange={handleBackgroundChange}
          documentColors={documentColors}
          brandColors={brandColors}
          onAddBrandColor={addBrandColor}
          onRemoveBrandColor={removeBrandColor}
        />

        {designMode === 'mobile' && hasMobileBackgroundColor && (
          <button
            onClick={clearMobileBackgroundColor}
            className="mt-2 w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Clear Mobile Override
          </button>
        )}
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Height
        </label>
        <input
          type="number"
          step="0.1"
          min="1"
          max="3"
          value={data.lineHeight}
          onChange={(e) => handleDataChange('lineHeight', parseFloat(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        />
      </div>

      {/* Mobile Typography Overrides */}
      <div className="pt-3 border-t border-gray-200">
        <div className="mb-2">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Mobile Typography
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
              {(hasMobileFontSize || hasMobileLineHeight) && (
                <span className="ml-1 inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
          {designMode === 'mobile' && (
            <p className="text-xs text-gray-500 mt-1">
              Override desktop font size for mobile devices
            </p>
          )}
        </div>

        {/* Mobile Font Size */}
        {designMode === 'mobile' && (
          <>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Mobile Font Size
                </label>
                {hasMobileFontSize && (
                  <button
                    onClick={clearMobileFontSize}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear Override
                  </button>
                )}
              </div>
              <input
                type="text"
                value={data.mobileFontSize || data.fontSize}
                onChange={(e) => handleDataChange('mobileFontSize', e.target.value)}
                placeholder={data.fontSize}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Desktop: {data.fontSize}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Mobile Line Height
                </label>
                {hasMobileLineHeight && (
                  <button
                    onClick={clearMobileLineHeight}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear Override
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={data.mobileLineHeight || data.lineHeight}
                onChange={(e) => handleDataChange('mobileLineHeight', parseFloat(e.target.value))}
                placeholder={data.lineHeight.toString()}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Desktop: {data.lineHeight}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
