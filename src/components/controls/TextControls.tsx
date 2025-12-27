/**
 * Text Block Controls
 * Properties specific to text blocks
 */

import { useMemo, useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, TextBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'
import { FontFamilyControl } from '@/components/controls/shared/FontFamilyControl'
import { SizeControl } from '@/components/controls/shared/SizeControl'

type DesignMode = 'desktop' | 'mobile'

interface TextControlsProps {
  block: EmailBlock & { data: TextBlockData }
}

export default function TextControls({ block }: TextControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const setShowBrandingModal = useEmailStore((state) => state.setShowBrandingModal)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const typographyStyles = useEmailStore((state) => state.email.settings.typographyStyles || [])
  const data = block.data as TextBlockData

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  // Get body typography style
  const bodyStyle = typographyStyles.find(s => s.name === 'body')

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
      {/* Brand Colors - Quick Access */}
      {brandColors.length > 0 && (
        <div className="pb-3 border-b border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Brand Colors
          </label>
          <div className="flex flex-wrap gap-2">
            {brandColors.slice(0, 6).map((brandColor) => (
              <button
                key={brandColor.color}
                onClick={() => handleDataChange('color', brandColor.color)}
                className="group relative"
                title={brandColor.name || brandColor.color}
              >
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all"
                  style={{ backgroundColor: brandColor.color }}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {brandColor.name}
                </span>
              </button>
            ))}
            {brandColors.length > 6 && (
              <button
                onClick={() => useEmailStore.getState().setActiveSidebarTab('branding')}
                className="w-8 h-8 rounded border-2 border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center text-gray-400 text-xs transition-colors"
                title="View all brand colors"
              >
                +{brandColors.length - 6}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Typography Style Preset - Quick Apply */}
      {bodyStyle && (
        <div className="pb-3 border-b border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Typography Style
          </label>
          <button
            onClick={() => {
              updateBlock(block.id, {
                data: {
                  ...data,
                  fontSize: bodyStyle.fontSize,
                  fontWeight: bodyStyle.fontWeight,
                  color: bodyStyle.color,
                  lineHeight: bodyStyle.lineHeight,
                  fontFamily: bodyStyle.fontFamily,
                }
              })
            }}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">Body Style</span>
              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">Apply</span>
            </div>
            <div
              className="text-xs text-gray-600"
              style={{
                fontFamily: bodyStyle.fontFamily,
                fontSize: '14px',
                color: bodyStyle.color
              }}
            >
              {bodyStyle.fontFamily.split(',')[0].replace(/['"]/g, '')} · {bodyStyle.fontSize}
            </div>
          </button>
          <button
            onClick={() => setShowBrandingModal(true)}
            className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700"
          >
            Edit Typography Styles →
          </button>
        </div>
      )}

      {/* Font Family */}
      <FontFamilyControl
        label="Font Family"
        value={data.fontFamily}
        onChange={(fontFamily) => handleDataChange('fontFamily', fontFamily)}
      />

      {/* Font Size */}
      <SizeControl
        label="Font Size"
        value={data.fontSize}
        onChange={(fontSize) => handleDataChange('fontSize', fontSize)}
        min={10}
        max={48}
        step={1}
        unit="px"
      />

      {/* Text Color - Full Picker */}
      <ColorThemePicker
        label="More Colors"
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
      <SizeControl
        label="Line Height"
        value={data.lineHeight.toString()}
        onChange={(lineHeight) => handleDataChange('lineHeight', parseFloat(lineHeight))}
        min={1.0}
        max={3.0}
        step={0.1}
        unit=""
      />

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

        {/* Mobile Typography Hint - Show when no overrides exist */}
        {designMode === 'mobile' && !hasMobileFontSize && !hasMobileLineHeight && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-blue-900 mb-1">
                  Optimize for mobile?
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  70%+ of emails are opened on mobile. Set mobile-specific font sizes for better readability.
                </p>
                <button
                  onClick={() => {
                    // Set a suggested mobile font size (smaller than desktop)
                    const desktopSize = parseInt(data.fontSize)
                    if (!isNaN(desktopSize)) {
                      const suggestedMobileSize = Math.max(14, Math.round(desktopSize * 0.875))
                      handleDataChange('mobileFontSize', `${suggestedMobileSize}px`)
                    }
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Add mobile override →
                </button>
              </div>
            </div>
          </div>
        )}

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
