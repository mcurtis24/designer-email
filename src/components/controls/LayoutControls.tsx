import type { EmailBlock, LayoutBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface LayoutControlsProps {
  block: EmailBlock & { data: LayoutBlockData }
}

export default function LayoutControls({ block }: LayoutControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)

  const handleColumnsChange = (columns: 1 | 2 | 3 | 4) => {
    // If reducing columns, trim children array to match column count
    const newChildren = block.data.children.slice(0, columns)

    updateBlock(block.id, {
      data: {
        ...block.data,
        columns,
        children: newChildren,
        // Reset column ratio when changing column count
        columnRatio: columns === 2 ? (block.data.columnRatio || '1-1') : columns === 3 ? '1-1-1' : columns === 4 ? '1-1-1-1' : undefined,
      },
    })
  }

  const handleGapChange = (gap: number) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        gap,
      },
    })
  }

  const handleColumnRatioChange = (columnRatio: '1-1' | '1-2' | '2-1') => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        columnRatio,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Columns
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleColumnsChange(1)}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.columns === 1
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            1
          </button>
          <button
            onClick={() => handleColumnsChange(2)}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.columns === 2
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            2
          </button>
          <button
            onClick={() => handleColumnsChange(3)}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.columns === 3
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            3
          </button>
          <button
            onClick={() => handleColumnsChange(4)}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.columns === 4
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            4
          </button>
        </div>
      </div>

      {/* Column Ratio Selection - Only show when 2 columns */}
      {block.data.columns === 2 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Column Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleColumnRatioChange('1-1')}
              className={`px-3 py-2 text-xs border rounded transition-colors ${
                (block.data.columnRatio || '1-1') === '1-1'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              50% / 50%
            </button>
            <button
              onClick={() => handleColumnRatioChange('1-2')}
              className={`px-3 py-2 text-xs border rounded transition-colors ${
                block.data.columnRatio === '1-2'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              33% / 66%
            </button>
            <button
              onClick={() => handleColumnRatioChange('2-1')}
              className={`px-3 py-2 text-xs border rounded transition-colors ${
                block.data.columnRatio === '2-1'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              66% / 33%
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gap: {block.data.gap}px
        </label>
        <input
          type="range"
          min="0"
          max="40"
          step="2"
          value={block.data.gap}
          onChange={(e) => handleGapChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0px</span>
          <span>40px</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Children Blocks
        </label>
        <div className="text-sm text-gray-600">
          {block.data.children.length} block{block.data.children.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
