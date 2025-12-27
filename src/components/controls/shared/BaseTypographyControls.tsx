/**
 * Base Typography Controls
 * Shared component for Text and Heading block controls
 * Eliminates ~375 lines of duplication between TextControls and HeadingControls
 */

import { ReactNode, useState, useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, TextBlockData, HeadingBlockData, TypographyStyle } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { FontFamilyControl } from '@/components/controls/shared/FontFamilyControl'
import { SizeControl } from '@/components/controls/shared/SizeControl'
import { useMobileOverrides } from '@/hooks/useMobileOverrides'

type DesignMode = 'desktop' | 'mobile'
type TypographyBlockData = TextBlockData | HeadingBlockData

interface BaseTypographyControlsProps<T extends TypographyBlockData> {
  block: EmailBlock & { data: T }
  typographyPresetName: 'body' | 'heading'
  typographyPresetLabel: string
  fontSizeMin: number
  fontSizeMax: number
  renderBeforeFontFamily?: (props: {
    data: T
    handleDataChange: (field: keyof T, value: any) => void
  }) => ReactNode
  documentColors: string[]
}

export function BaseTypographyControls<T extends TypographyBlockData>({
  block,
  typographyPresetName,
  typographyPresetLabel,
  fontSizeMin,
  fontSizeMax,
  renderBeforeFontFamily,
  documentColors,
}: BaseTypographyControlsProps<T>) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const setShowBrandingModal = useEmailStore((state) => state.setShowBrandingModal)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const typographyStyles = useEmailStore((state) => state.email.settings.typographyStyles || [])
  const data = block.data as T

  // Get typography style
  const typographyStyle = typographyStyles.find(s => s.name === typographyPresetName)

  // Design mode toggle (desktop/mobile)
  const [designMode, setDesignMode] = useState<DesignMode>('desktop')

  // Track if user has seen mobile hint (localStorage)
  const [showMobileHint, setShowMobileHint] = useState(() => {
    const hasSeenHint = localStorage.getItem('hasSeenMobileHint')
    return hasSeenHint !== 'true'
  })

  // Use mobile overrides hook
  const {
    hasMobileFontSize,
    hasMobileLineHeight,
    hasMobileBackgroundColor,
    clearMobileFontSize,
    clearMobileLineHeight,
    clearMobileBackgroundColor,
    handleBackgroundChange,
  } = useMobileOverrides(block)

  // Mark hint as seen when user switches to mobile mode
  useEffect(() => {
    if (designMode === 'mobile' && showMobileHint) {
      localStorage.setItem('hasSeenMobileHint', 'true')
      // Keep showing for this session, hide on next mount
      setTimeout(() => setShowMobileHint(false), 5000)
    }
  }, [designMode, showMobileHint])

  // Count active mobile overrides
  const mobileOverrideCount = [
    hasMobileFontSize,
    hasMobileLineHeight,
    hasMobileBackgroundColor,
  ].filter(Boolean).length

  // Clear all mobile overrides
  const clearAllMobileOverrides = () => {
    if (hasMobileFontSize) clearMobileFontSize()
    if (hasMobileLineHeight) clearMobileLineHeight()
    if (hasMobileBackgroundColor) clearMobileBackgroundColor()
    setDesignMode('desktop')
  }

  const handleDataChange = (field: keyof T, value: any) => {
    const fieldsToWatch = ['fontFamily', 'fontSize', 'fontWeight', 'color', 'lineHeight']
    const shouldClearPreset = fieldsToWatch.includes(field as string)

    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
        ...(shouldClearPreset && { appliedPreset: null }),
      },
    })
  }

  const applyTypographyPreset = (style: TypographyStyle) => {
    updateBlock(block.id, {
      data: {
        ...data,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.color,
        lineHeight: style.lineHeight,
        fontFamily: style.fontFamily,
        appliedPreset: typographyPresetName,
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Global Desktop/Mobile Mode Toggle */}
      <div className="sticky top-0 bg-white z-10 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Editing Mode</span>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setDesignMode('desktop')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                designMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setDesignMode('mobile')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                designMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mobile
              {mobileOverrideCount > 0 && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
        {/* Mobile Overrides Count & Clear All */}
        {mobileOverrideCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-600 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              {mobileOverrideCount} mobile override{mobileOverrideCount !== 1 ? 's' : ''} active
            </span>
            <button
              onClick={clearAllMobileOverrides}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>
        )}
        {designMode === 'mobile' && showMobileHint && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 mb-1">Mobile Mode Active</p>
                <p className="text-xs text-blue-700">
                  Changes will only apply on devices under 600px width. Desktop values remain unchanged unless overridden.
                </p>
              </div>
            </div>
          </div>
        )}
        {designMode === 'mobile' && !showMobileHint && (
          <p className="text-xs text-gray-500 mt-2">
            Mobile overrides apply on devices under 600px width
          </p>
        )}
      </div>

      {/* TYPOGRAPHY Section */}
      <div className="pt-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Typography
        </h3>
      </div>

      {/* Typography Style Preset */}
      {typographyStyle && (
        <div className="pb-3 border-b border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Typography Style
          </label>

          {/* Preset Active Indicator */}
          {data.appliedPreset === typographyPresetName && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-blue-900">Using {typographyPresetLabel} preset</span>
              </div>
              <button
                onClick={() => applyTypographyPreset(typographyStyle)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Reapply
              </button>
            </div>
          )}

          <button
            onClick={() => applyTypographyPreset(typographyStyle)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{typographyPresetLabel}</span>
              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">Apply</span>
            </div>
            <div
              className="text-xs text-gray-600"
              style={{
                fontFamily: typographyStyle.fontFamily,
                fontSize: '14px',
                color: typographyStyle.color
              }}
            >
              {typographyStyle.fontFamily.split(',')[0].replace(/['"]/g, '')} · {typographyStyle.fontSize}
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

      {/* Render custom controls before Font Family (e.g., Heading Level, Font Weight) */}
      {renderBeforeFontFamily?.({ data, handleDataChange })}

      {/* Font Family */}
      <FontFamilyControl
        label="Font Family"
        value={data.fontFamily}
        onChange={(fontFamily) => handleDataChange('fontFamily' as keyof T, fontFamily)}
      />

      {/* Font Size */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            Font Size
            {hasMobileFontSize && designMode === 'desktop' && (
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" title="Has mobile override"></span>
            )}
          </label>
          {designMode === 'mobile' && hasMobileFontSize && (
            <button
              onClick={() => {
                clearMobileFontSize()
                setDesignMode('desktop')
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Override
            </button>
          )}
        </div>
        <SizeControl
          label=""
          value={designMode === 'mobile' && data.mobileFontSize ? data.mobileFontSize : data.fontSize}
          onChange={(fontSize) => {
            if (designMode === 'mobile') {
              handleDataChange('mobileFontSize' as keyof T, fontSize)
            } else {
              handleDataChange('fontSize' as keyof T, fontSize)
            }
          }}
          min={fontSizeMin}
          max={fontSizeMax}
          step={1}
          unit="px"
        />
        {designMode === 'mobile' && (
          <p className="text-xs text-gray-500 mt-1">
            Desktop: {data.fontSize}
          </p>
        )}
      </div>

      {/* Line Height */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            Line Height
            {hasMobileLineHeight && designMode === 'desktop' && (
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" title="Has mobile override"></span>
            )}
          </label>
          {designMode === 'mobile' && hasMobileLineHeight && (
            <button
              onClick={() => {
                clearMobileLineHeight()
                setDesignMode('desktop')
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Override
            </button>
          )}
        </div>
        <SizeControl
          label=""
          value={(designMode === 'mobile' && data.mobileLineHeight ? data.mobileLineHeight : data.lineHeight).toString()}
          onChange={(lineHeight) => {
            if (designMode === 'mobile') {
              handleDataChange('mobileLineHeight' as keyof T, parseFloat(lineHeight))
            } else {
              handleDataChange('lineHeight' as keyof T, parseFloat(lineHeight))
            }
          }}
          min={1.0}
          max={3.0}
          step={0.1}
          unit=""
        />
        {designMode === 'mobile' && (
          <p className="text-xs text-gray-500 mt-1">
            Desktop: {data.lineHeight}
          </p>
        )}
      </div>

      {/* COLORS Section */}
      <div className="pt-3 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Colors
        </h3>
      </div>

      {/* Text Color */}
      <ColorThemePicker
        label="Text Color"
        value={data.color}
        onChange={(color) => handleDataChange('color' as keyof T, color)}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Background Color */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            Background Color
            {hasMobileBackgroundColor && designMode === 'desktop' && (
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" title="Has mobile override"></span>
            )}
          </label>
          {designMode === 'mobile' && hasMobileBackgroundColor && (
            <button
              onClick={() => {
                clearMobileBackgroundColor()
                setDesignMode('desktop')
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Override
            </button>
          )}
        </div>

        <ColorThemePicker
          label=""
          value={
            designMode === 'mobile' && block.styles.mobileStyles?.backgroundColor
              ? block.styles.mobileStyles.backgroundColor
              : block.styles.backgroundColor || '#ffffff'
          }
          onChange={(color) => handleBackgroundChange(color, designMode === 'mobile')}
          documentColors={documentColors}
          brandColors={brandColors}
          onAddBrandColor={addBrandColor}
          onRemoveBrandColor={removeBrandColor}
        />

        {designMode === 'mobile' && (
          <p className="text-xs text-gray-500 mt-2">
            Desktop: {block.styles.backgroundColor || '#ffffff'}
          </p>
        )}
      </div>
    </div>
  )
}
