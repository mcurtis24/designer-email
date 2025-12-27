/**
 * Button Block Controls
 * Properties specific to button blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, ButtonBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'
import { AlignmentControl } from '@/components/controls/shared/AlignmentControl'
import { SizeControl } from '@/components/controls/shared/SizeControl'

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
      <SizeControl
        label="Button Width"
        value={(data.width || 200).toString()}
        onChange={(width) => handleDataChange('width', parseInt(width))}
        min={100}
        max={400}
        step={10}
        unit="px"
      />

      {/* Alignment */}
      <AlignmentControl
        label="Alignment"
        value={data.alignment}
        onChange={(alignment) => handleDataChange('alignment', alignment)}
        showJustify={false}
      />

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
      <SizeControl
        label="Border Radius"
        value={data.borderRadius.toString()}
        onChange={(borderRadius) => handleDataChange('borderRadius', parseInt(borderRadius))}
        min={0}
        max={50}
        step={1}
        unit="px"
      />
    </div>
  )
}
