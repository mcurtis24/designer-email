/**
 * Quick Apply Toolbar Component
 * Context-aware toolbar for applying brand colors to selected blocks
 */

import { useEmailStore } from '@/stores/emailStore'
import type { BrandColor } from '@/types/email'

interface QuickApplyToolbarProps {
  brandColors: BrandColor[]
}

export default function QuickApplyToolbar({ brandColors }: QuickApplyToolbarProps) {
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const blocks = useEmailStore((state) => state.email.blocks)
  const updateBlock = useEmailStore((state) => state.updateBlock)

  // Find the selected block
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  if (!selectedBlock || brandColors.length === 0) {
    return null
  }

  const applyColor = (color: string, target: 'background' | 'text' | 'button') => {
    switch (selectedBlock.type) {
      case 'heading':
      case 'text':
        if (target === 'text') {
          updateBlock(selectedBlock.id, {
            data: { ...selectedBlock.data, color },
          })
        } else if (target === 'background') {
          updateBlock(selectedBlock.id, {
            styles: { ...selectedBlock.styles, backgroundColor: color },
          })
        }
        break

      case 'button':
        if (target === 'button' || target === 'background') {
          updateBlock(selectedBlock.id, {
            data: { ...selectedBlock.data, backgroundColor: color },
          })
        } else if (target === 'text') {
          updateBlock(selectedBlock.id, {
            data: { ...selectedBlock.data, textColor: color },
          })
        }
        break

      case 'divider':
        if (target === 'text') {
          updateBlock(selectedBlock.id, {
            data: { ...selectedBlock.data, color },
          })
        } else if (target === 'background') {
          updateBlock(selectedBlock.id, {
            styles: { ...selectedBlock.styles, backgroundColor: color },
          })
        }
        break

      case 'footer':
        if (target === 'background') {
          updateBlock(selectedBlock.id, {
            data: { ...selectedBlock.data, backgroundColor: color },
          })
        } else if (target === 'text') {
          updateBlock(selectedBlock.id, {
            data: { ...selectedBlock.data, textColor: color },
          })
        }
        break

      case 'spacer':
      case 'layout':
      case 'image':
      case 'gallery':
        if (target === 'background') {
          updateBlock(selectedBlock.id, {
            styles: { ...selectedBlock.styles, backgroundColor: color },
          })
        }
        break
    }
  }

  // Determine which apply options to show based on block type
  const showTextOption = ['heading', 'text', 'button', 'divider', 'footer'].includes(
    selectedBlock.type
  )
  const showBackgroundOption = true // All blocks support background color
  const showButtonOption = selectedBlock.type === 'button'

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 mb-4">
      <div className="mb-2">
        <h3 className="text-xs font-semibold text-gray-700">
          Quick Apply
          <span className="ml-1 text-gray-500 font-normal">
            ({selectedBlock.type} selected)
          </span>
        </h3>
      </div>

      {/* Apply to Background */}
      {showBackgroundOption && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1.5">Apply to background:</div>
          <div className="flex flex-wrap gap-1.5">
            {brandColors.map((brandColor) => (
              <button
                key={`bg-${brandColor.color}`}
                onClick={() => applyColor(brandColor.color, 'background')}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                style={{ backgroundColor: brandColor.color }}
                title={`Apply ${brandColor.name || brandColor.color} to background`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Apply to Text */}
      {showTextOption && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1.5">
            Apply to {selectedBlock.type === 'button' ? 'button text' : 'text'}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brandColors.map((brandColor) => (
              <button
                key={`text-${brandColor.color}`}
                onClick={() => applyColor(brandColor.color, 'text')}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                style={{ backgroundColor: brandColor.color }}
                title={`Apply ${brandColor.name || brandColor.color} to text`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Apply to Button Background (only for button blocks) */}
      {showButtonOption && (
        <div>
          <div className="text-xs text-gray-600 mb-1.5">Apply to button background:</div>
          <div className="flex flex-wrap gap-1.5">
            {brandColors.map((brandColor) => (
              <button
                key={`btn-${brandColor.color}`}
                onClick={() => applyColor(brandColor.color, 'button')}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                style={{ backgroundColor: brandColor.color }}
                title={`Apply ${brandColor.name || brandColor.color} to button`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
