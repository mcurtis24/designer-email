/**
 * Spacer Block Controls
 * Properties specific to spacer blocks
 */

import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, SpacerBlockData } from '@/types/email'

interface SpacerControlsProps {
  block: EmailBlock & { data: SpacerBlockData }
}

export default function SpacerControls({ block }: SpacerControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const data = block.data as SpacerBlockData

  const handleHeightChange = (height: number) => {
    updateBlock(block.id, {
      data: {
        ...data,
        height,
      },
    })
  }

  // Common spacer height presets
  const presets = [
    { label: 'XS', value: 8 },
    { label: 'S', value: 16 },
    { label: 'M', value: 24 },
    { label: 'L', value: 32 },
    { label: 'XL', value: 48 },
    { label: 'XXL', value: 64 },
  ]

  return (
    <div className="space-y-4">
      {/* Height Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Height (px)
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="range"
            min="4"
            max="128"
            step="4"
            value={data.height}
            onChange={(e) => handleHeightChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={data.height}
            onChange={(e) => handleHeightChange(parseInt(e.target.value))}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="4"
            max="128"
            step="4"
          />
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleHeightChange(preset.value)}
              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                data.height === preset.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {preset.label}
              <br />
              <span className="text-xs opacity-75">{preset.value}px</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
          <div
            className="bg-blue-200 rounded"
            style={{ height: `${data.height}px` }}
          />
          <p className="text-xs text-gray-600 mt-2 text-center">
            {data.height}px spacing
          </p>
        </div>
      </div>
    </div>
  )
}
