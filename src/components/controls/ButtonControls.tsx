/**
 * Button Block Controls
 * Properties specific to button blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, ButtonBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

interface ButtonControlsProps {
  block: EmailBlock & { data: ButtonBlockData }
}

export default function ButtonControls({ block }: ButtonControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const data = block.data as ButtonBlockData

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  const handleDataChange = (field: keyof ButtonBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Button Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Text
        </label>
        <input
          type="text"
          value={data.text}
          onChange={(e) => handleDataChange('text', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="Click here"
        />
      </div>

      {/* Link URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link URL
        </label>
        <input
          type="url"
          value={data.linkUrl}
          onChange={(e) => handleDataChange('linkUrl', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="https://example.com"
        />
      </div>

      {/* Button Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Width (px)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="100"
            max="400"
            value={data.width}
            onChange={(e) => handleDataChange('width', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={data.width}
            onChange={(e) => handleDataChange('width', parseInt(e.target.value))}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="100"
            max="400"
          />
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => handleDataChange('alignment', align)}
              className={`flex-1 px-3 py-2 text-sm border rounded-md transition-colors capitalize ${
                data.alignment === align
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Button Background Color */}
      <ColorThemePicker
        label="Button Color"
        value={data.backgroundColor}
        onChange={(color) => handleDataChange('backgroundColor', color)}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Text Color */}
      <ColorThemePicker
        label="Text Color"
        value={data.textColor}
        onChange={(color) => handleDataChange('textColor', color)}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Radius (px)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="50"
            value={data.borderRadius}
            onChange={(e) => handleDataChange('borderRadius', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={data.borderRadius}
            onChange={(e) => handleDataChange('borderRadius', parseInt(e.target.value))}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="0"
            max="50"
          />
        </div>
      </div>
    </div>
  )
}
