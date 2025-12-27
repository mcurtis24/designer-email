/**
 * Heading Block Controls
 * Properties specific to heading blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, HeadingBlockData } from '@/types/email'
import { extractDocumentColors } from '@/lib/colorUtils'
import { BaseTypographyControls } from '@/components/controls/shared/BaseTypographyControls'

interface HeadingControlsProps {
  block: EmailBlock & { data: HeadingBlockData }
}

export default function HeadingControls({ block }: HeadingControlsProps) {
  const blocks = useEmailStore((state) => state.email.blocks)

  // Extract document colors from all blocks (shared via prop to avoid duplicate computation)
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  return (
    <BaseTypographyControls
      block={block}
      typographyPresetName="heading"
      typographyPresetLabel="Heading Style"
      fontSizeMin={12}
      fontSizeMax={72}
      documentColors={documentColors}
      renderBeforeFontFamily={({ data, handleDataChange }) => (
        <>
          {/* Heading Level */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Heading Level
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => handleDataChange('level' as keyof HeadingBlockData, level)}
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
              onChange={(e) => handleDataChange('fontWeight' as keyof HeadingBlockData, parseInt(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi-bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra-bold (800)</option>
            </select>
          </div>
        </>
      )}
    />
  )
}
