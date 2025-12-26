import { useState, useEffect, useRef } from 'react'
import { Plus, Palette } from 'lucide-react'
import { useEmailStore } from '@/stores/emailStore'
import type { BrandColor } from '@/types/email'

interface ColorThemePickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  documentColors?: string[]
  brandColors?: BrandColor[]
  onAddBrandColor?: (color: string) => void
  onRemoveBrandColor?: (color: string) => void
}

// Canva-style default color palette - organized in rows
const DEFAULT_SOLID_COLORS = [
  // Grayscale row
  ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
  // Reds
  ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
  // Blues & Teals
  ['#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC'],
  // Pastels
  ['#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD'],
  // Mid tones
  ['#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0'],
  // Rich colors
  ['#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79'],
  // Deep colors
  ['#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47'],
  // Dark colors
  ['#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'],
]

export function ColorThemePicker({
  value,
  onChange,
  label,
  documentColors = [],
  brandColors = [],
  onAddBrandColor,
  onRemoveBrandColor,
}: ColorThemePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [shouldPulse, setShouldPulse] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const activeSidebarTab = useEmailStore((state) => state.activeSidebarTab)
  const editingBlockId = useEmailStore((state) => state.editorState.editingBlockId)
  const autoOpenColorPicker = useEmailStore((state) => state.autoOpenColorPicker)
  const setAutoOpenColorPicker = useEmailStore((state) => state.setAutoOpenColorPicker)

  // Trigger pulse animation when sidebar opens to style tab while editing
  useEffect(() => {
    if (activeSidebarTab === 'style' && editingBlockId) {
      setShouldPulse(true)
      const timer = setTimeout(() => setShouldPulse(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [activeSidebarTab, editingBlockId])

  // Auto-open color picker when triggered from toolbar
  useEffect(() => {
    if (autoOpenColorPicker && !isOpen && label === 'Text Color' && buttonRef.current) {
      // Get button position from ref
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonRect(rect)
      setIsOpen(true)
      setAutoOpenColorPicker(false) // Reset flag
    }
  }, [autoOpenColorPicker, isOpen, label, setAutoOpenColorPicker])

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setButtonRect(rect)
    setIsOpen(!isOpen)
  }

  // Filter colors based on search
  const filterColor = (color: string) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return color.toLowerCase().includes(query)
  }

  const handleColorClick = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-gray-700">{label}</label>}

      <div className="relative">
        {/* Color preview button */}
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 transition-colors ${
            shouldPulse ? 'animate-pulse-ring' : ''
          }`}
        >
          <div
            className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="flex-1 text-left text-xs">{value.toUpperCase()}</span>
          <Palette className="w-4 h-4 text-gray-400" />
        </button>

        {/* Dropdown panel */}
        {isOpen && buttonRect && (
          <div
            className="fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[calc(100vh-100px)] overflow-y-auto"
            style={{
              top: `${Math.min(window.innerHeight - 650, buttonRect.bottom + 8)}px`,
              left: `${buttonRect.left}px`
            }}
          >
            <div className="p-3 space-y-3">
              {/* Search input */}
              <input
                type="text"
                placeholder='Try "blue" or "#00c4cc"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Brand Kit - PRIMARY (shown first) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Brand Kit</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {/* Add color button */}
                  <button
                    onClick={() => {
                      const newColor = value
                      if (onAddBrandColor && !brandColors.some((bc) => bc.color === newColor)) {
                        onAddBrandColor(newColor)
                      }
                    }}
                    className="w-7 h-7 rounded border-2 border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                    title="Add current color to brand kit"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {brandColors.filter((bc) => filterColor(bc.color)).map((brandColor, index) => (
                    <div key={`brand-${index}`} className="relative group">
                      <button
                        onClick={() => handleColorClick(brandColor.color)}
                        className="w-7 h-7 rounded border-2 border-gray-200 hover:border-blue-500 transition-colors"
                        style={{ backgroundColor: brandColor.color }}
                        title={brandColor.name || brandColor.color}
                      />
                      {onRemoveBrandColor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveBrandColor(brandColor.color)
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center"
                          title="Remove from brand kit"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {brandColors.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Click + to add colors to your brand kit</p>
                )}
              </div>

              {/* Document colors - SECONDARY */}
              {documentColors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Document colors</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {documentColors.filter(filterColor).map((color, index) => (
                      <button
                        key={`doc-${index}`}
                        onClick={() => handleColorClick(color)}
                        className="w-7 h-7 rounded border-2 border-gray-200 hover:border-blue-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Default solid colors - TERTIARY (collapsed by default) */}
              <details className="mt-4 pt-4 border-t border-gray-200">
                <summary className="text-xs font-medium text-gray-600 mb-2 cursor-pointer hover:text-gray-900 transition-colors">
                  Default solid colors
                </summary>
                <div className="space-y-0.5 mt-2">
                  {DEFAULT_SOLID_COLORS.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-0.5">
                      {row.filter(filterColor).map((color, colIndex) => (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleColorClick(color)}
                          className="w-7 h-6 rounded border border-gray-200 hover:border-blue-500 hover:scale-105 transition-all"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </details>

              {/* Custom color input */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue)) {
                        onChange(newValue)
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Pulse animation CSS */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            border-color: rgb(59, 130, 246);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
            border-color: rgb(59, 130, 246);
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1s ease-out 2;
        }
      `}</style>
    </div>
  )
}
