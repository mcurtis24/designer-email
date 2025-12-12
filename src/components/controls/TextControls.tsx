/**
 * Text Block Controls
 * Properties specific to text blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, TextBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

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

  const handleDataChange = (field: keyof TextBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

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
    </div>
  )
}
