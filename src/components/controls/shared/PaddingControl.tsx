import { useState } from 'react'
import type { SpacingValue } from '@/types/email'

interface PaddingControlProps {
  label: string
  value: SpacingValue
  onChange: (padding: SpacingValue) => void
}

export function PaddingControl({ label, value, onChange }: PaddingControlProps) {
  const [isLinked, setIsLinked] = useState(
    value.top === value.right && value.right === value.bottom && value.bottom === value.left
  )

  const handleLinkedChange = (newValue: string) => {
    const numValue = parseInt(newValue) || 0
    onChange({
      top: `${numValue}px`,
      right: `${numValue}px`,
      bottom: `${numValue}px`,
      left: `${numValue}px`,
    })
  }

  const handleSideChange = (side: keyof SpacingValue, newValue: string) => {
    const numValue = parseInt(newValue) || 0
    if (isLinked) {
      onChange({
        top: `${numValue}px`,
        right: `${numValue}px`,
        bottom: `${numValue}px`,
        left: `${numValue}px`,
      })
    } else {
      onChange({
        ...value,
        [side]: `${numValue}px`,
      })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          {label}
        </label>
        <button
          onClick={() => {
            const newLinked = !isLinked
            setIsLinked(newLinked)
            if (newLinked) {
              // When linking, use top value for all sides
              onChange({
                top: value.top,
                right: value.top,
                bottom: value.top,
                left: value.top,
              })
            }
          }}
          type="button"
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isLinked ? 'Unlink sides' : 'Link all sides'}
        >
          {isLinked ? (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {isLinked ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={parseInt(value.top) || 0}
            onChange={(e) => handleLinkedChange(e.target.value)}
            min={0}
            max={100}
            className="flex-1 h-10 px-3 text-center rounded-md border border-gray-300 text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <span className="text-sm text-gray-500 font-medium">px</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* Top */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-12">Top</span>
              <input
                type="number"
                value={parseInt(value.top) || 0}
                onChange={(e) => handleSideChange('top', e.target.value)}
                min={0}
                max={100}
                className="flex-1 h-8 px-2 text-center rounded border border-gray-300 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>

          {/* Left & Right */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Left</span>
            <input
              type="number"
              value={parseInt(value.left) || 0}
              onChange={(e) => handleSideChange('left', e.target.value)}
              min={0}
              max={100}
              className="flex-1 h-8 px-2 text-center rounded border border-gray-300 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Right</span>
            <input
              type="number"
              value={parseInt(value.right) || 0}
              onChange={(e) => handleSideChange('right', e.target.value)}
              min={0}
              max={100}
              className="flex-1 h-8 px-2 text-center rounded border border-gray-300 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>

          {/* Bottom */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-12">Bottom</span>
              <input
                type="number"
                value={parseInt(value.bottom) || 0}
                onChange={(e) => handleSideChange('bottom', e.target.value)}
                min={0}
                max={100}
                className="flex-1 h-8 px-2 text-center rounded border border-gray-300 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
