/**
 * Heading Block Controls
 * Properties specific to heading blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, HeadingBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

interface HeadingControlsProps {
  block: EmailBlock & { data: HeadingBlockData }
}

export default function HeadingControls({ block }: HeadingControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const data = block.data as HeadingBlockData

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  const handleDataChange = (field: keyof HeadingBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-3">
      {/* Heading Level */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Heading Level
        </label>
        <div className="flex gap-2">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => handleDataChange('level', level)}
              className={`flex-1 px-3 py-2 text-sm border rounded-md transition-colors ${
                data.level === level
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              H{level}
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Font Weight
        </label>
        <select
          value={data.fontWeight}
          onChange={(e) => handleDataChange('fontWeight', parseInt(e.target.value))}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="400">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-bold (600)</option>
          <option value="700">Bold (700)</option>
          <option value="800">Extra-bold (800)</option>
        </select>
      </div>

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

      {/* Background Color */}
      <ColorThemePicker
        label="Background Color"
        value={block.styles.backgroundColor || '#ffffff'}
        onChange={(color) => updateBlock(block.id, {
          styles: {
            ...block.styles,
            backgroundColor: color,
          },
        })}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Line Height */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Line Height
        </label>
        <input
          type="number"
          step="0.1"
          min="1"
          max="3"
          value={data.lineHeight}
          onChange={(e) => handleDataChange('lineHeight', parseFloat(e.target.value))}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
        />
      </div>
    </div>
  )
}
