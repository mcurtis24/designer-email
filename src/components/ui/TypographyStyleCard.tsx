/**
 * Typography Style Card Component
 * Displays and edits typography style presets (Heading, Body)
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Type } from 'lucide-react'
import { ColorThemePicker } from './ColorThemePicker'
import type { TypographyStyle, BrandColor } from '@/types/email'

interface TypographyStyleCardProps {
  style: TypographyStyle
  brandColors: BrandColor[]
  onUpdate: (styleName: 'heading' | 'body', updates: Partial<TypographyStyle>) => void
  onApplyToAll: (styleName: 'heading' | 'body') => void
  blockCount: number // Number of blocks that will be affected
}

// Common web-safe and Google Fonts for emails
const EMAIL_SAFE_FONTS = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'System (San Francisco/Segoe)', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
]

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '42px', '48px']

const FONT_WEIGHTS = [
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semi-Bold', value: 600 },
  { label: 'Bold', value: 700 },
]

export default function TypographyStyleCard({
  style,
  brandColors,
  onUpdate,
  onApplyToAll,
  blockCount,
}: TypographyStyleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const styleName = style.name === 'heading' ? 'Heading Style' : 'Body Text Style'
  const blockType = style.name === 'heading' ? 'heading' : 'text'

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{styleName}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {style.fontFamily.split(',')[0].replace(/['"]/g, '')} · {style.fontSize} ·{' '}
                {style.fontWeight === 700 ? 'Bold' : 'Regular'}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Live Preview */}
        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
          <div
            style={{
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              color: style.color,
              lineHeight: style.lineHeight,
            }}
          >
            {style.name === 'heading' ? 'The Quick Brown Fox' : 'The quick brown fox jumps over the lazy dog'}
          </div>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-4 bg-gray-50">
          {/* Font Family */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Font Family</label>
            <select
              value={style.fontFamily}
              onChange={(e) => onUpdate(style.name, { fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EMAIL_SAFE_FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Desktop Size</label>
              <select
                value={style.fontSize}
                onChange={(e) => onUpdate(style.name, { fontSize: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Mobile Size</label>
              <select
                value={style.mobileFontSize || style.fontSize}
                onChange={(e) => onUpdate(style.name, { mobileFontSize: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Font Weight</label>
            <select
              value={style.fontWeight}
              onChange={(e) => onUpdate(style.name, { fontWeight: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONT_WEIGHTS.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Text Color</label>
            <ColorThemePicker
              value={style.color}
              onChange={(color) => onUpdate(style.name, { color })}
              brandColors={brandColors}
            />
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Line Height: {style.lineHeight}
            </label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={style.lineHeight}
              onChange={(e) => onUpdate(style.name, { lineHeight: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Tight (1.0)</span>
              <span>Normal (1.5)</span>
              <span>Loose (2.0)</span>
            </div>
          </div>

          {/* Apply to All Button */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                if (
                  confirm(
                    `Apply this style to all ${blockCount} ${blockType} block${blockCount !== 1 ? 's' : ''}?`
                  )
                ) {
                  onApplyToAll(style.name)
                }
              }}
              disabled={blockCount === 0}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Apply to {blockCount} {blockType} block{blockCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
