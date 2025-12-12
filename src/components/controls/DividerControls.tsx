/**
 * Divider Block Controls
 * Properties specific to divider blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, DividerBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

interface DividerControlsProps {
  block: EmailBlock & { data: DividerBlockData }
}

export default function DividerControls({ block }: DividerControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const data = block.data as DividerBlockData

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  const handleDataChange = (field: keyof DividerBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Line Style */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Line Style
        </label>
        <div className="flex gap-2">
          {(['solid', 'dashed', 'dotted'] as const).map((style) => (
            <button
              key={style}
              onClick={() => handleDataChange('style', style)}
              className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all capitalize ${
                data.style === style
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Line Color */}
      <ColorThemePicker
        label="Line Color"
        value={data.color}
        onChange={(color) => handleDataChange('color', color)}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Line Thickness */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Line Thickness (px)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="1"
            max="10"
            value={data.thickness}
            onChange={(e) => handleDataChange('thickness', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={data.thickness}
            onChange={(e) => handleDataChange('thickness', parseInt(e.target.value))}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="1"
            max="10"
          />
        </div>
      </div>

      {/* Line Width */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Line Width
        </label>
        <div className="flex gap-2">
          <select
            value={data.width || '100%'}
            onChange={(e) => handleDataChange('width', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="100%">Full Width (100%)</option>
            <option value="75%">75%</option>
            <option value="50%">50%</option>
            <option value="25%">25%</option>
          </select>
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Spacing (Top/Bottom)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="64"
            step="4"
            value={parseInt(data.padding?.split(' ')[0] || '16')}
            onChange={(e) => handleDataChange('padding', `${e.target.value}px 0`)}
            className="flex-1"
          />
          <input
            type="number"
            value={parseInt(data.padding?.split(' ')[0] || '16')}
            onChange={(e) => handleDataChange('padding', `${e.target.value}px 0`)}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="0"
            max="64"
            step="4"
          />
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div style={{ padding: data.padding || '16px 0' }}>
            <hr
              style={{
                width: data.width || '100%',
                height: '0',
                border: 'none',
                borderTop: `${data.thickness || 1}px ${data.style || 'solid'} ${
                  data.color || '#e5e7eb'
                }`,
                margin: '0 auto',
                padding: '0',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
