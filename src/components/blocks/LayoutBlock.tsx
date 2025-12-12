import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { EmailBlock, LayoutBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'
import BlockRenderer from './BlockRenderer'

interface LayoutBlockProps {
  block: EmailBlock & { data: LayoutBlockData }
  isSelected?: boolean
  onClick?: () => void
  onFormatRequest?: (handler: (command: string, value?: string) => void) => void
  onActiveStatesChange?: (states: { isBold: boolean; isItalic: boolean; isUnderline: boolean }) => void
}

function LayoutBlock({ block, isSelected, onClick, onFormatRequest, onActiveStatesChange }: LayoutBlockProps) {
  const { data, styles } = block
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const selectBlock = useEmailStore((state) => state.selectBlock)
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const { setNodeRef: setDropRef1, isOver: isOver1 } = useDroppable({
    id: `${block.id}-col-0`,
  })

  const { setNodeRef: setDropRef2, isOver: isOver2 } = useDroppable({
    id: `${block.id}-col-1`,
  })

  const { setNodeRef: setDropRef3, isOver: isOver3 } = useDroppable({
    id: `${block.id}-col-2`,
  })

  const { setNodeRef: setDropRef4, isOver: isOver4 } = useDroppable({
    id: `${block.id}-col-3`,
  })

  const handleAddColumn = () => {
    if (data.columns < 4) {
      updateBlock(block.id, {
        data: {
          ...data,
          columns: (data.columns + 1) as 1 | 2 | 3 | 4,
          columnRatio: data.columns === 1 ? '1-1' : data.columns === 2 ? '1-1-1' : '1-1-1-1',
        },
      })
    }
  }

  const handleRemoveColumn = () => {
    if (data.columns > 1) {
      // Remove the last child block
      const newChildren = data.children.slice(0, data.columns - 1)
      updateBlock(block.id, {
        data: {
          ...data,
          columns: (data.columns - 1) as 1 | 2 | 3 | 4,
          children: newChildren,
          columnRatio: data.columns === 4 ? '1-1-1' : data.columns === 3 ? '1-1' : undefined,
        },
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only handle clicks on the layout container itself, not on nested blocks
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.border-dashed')) {
      return
    }

    e.stopPropagation()

    // Select the block
    onClick?.()

    // Switch to Style tab
    setActiveSidebarTab('style')
  }

  const gap = data.gap || 8

  // Calculate grid template columns based on ratio
  const getGridTemplateColumns = () => {
    if (data.columns === 1) return '1fr'
    if (data.columns === 3) return '1fr 1fr 1fr' // Equal 3 columns
    if (data.columns === 4) return '1fr 1fr 1fr 1fr' // Equal 4 columns

    const ratio = data.columnRatio || '1-1'
    switch (ratio) {
      case '1-2':
        return '1fr 2fr' // 33% / 66%
      case '2-1':
        return '2fr 1fr' // 66% / 33%
      default:
        return '1fr 1fr' // 50% / 50%
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      style={{
        paddingTop: styles.padding?.top,
        paddingRight: styles.padding?.right,
        paddingBottom: styles.padding?.bottom,
        paddingLeft: styles.padding?.left,
        backgroundColor: styles.backgroundColor,
      }}
    >
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: getGridTemplateColumns(),
          gap: `${gap}px`,
        }}
      >
        {/* Column 1 */}
        <div
          ref={setDropRef1}
          className={`min-h-[120px] border-2 border-dashed rounded-xl transition-all ${
            isOver1 ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          {data.children[0] ? (
            <BlockRenderer
              block={data.children[0]}
              isSelected={selectedBlockId === data.children[0].id}
              onClick={() => {
                selectBlock(data.children[0].id)
                setActiveSidebarTab('style')
              }}
              onFormatRequest={onFormatRequest}
              onActiveStatesChange={onActiveStatesChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4">
              Drop a block here
            </div>
          )}
        </div>

        {/* Column 2 (if 2+ column layout) */}
        {data.columns >= 2 && (
          <div
            ref={setDropRef2}
            className={`min-h-[120px] border-2 border-dashed rounded-xl transition-all ${
              isOver2 ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            {data.children[1] ? (
              <BlockRenderer
                block={data.children[1]}
                isSelected={selectedBlockId === data.children[1].id}
                onClick={() => {
                  selectBlock(data.children[1].id)
                  setActiveSidebarTab('style')
                }}
                onFormatRequest={onFormatRequest}
                onActiveStatesChange={onActiveStatesChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4">
                Drop a block here
              </div>
            )}
          </div>
        )}

        {/* Column 3 (if 3+ column layout) */}
        {data.columns >= 3 && (
          <div
            ref={setDropRef3}
            className={`min-h-[120px] border-2 border-dashed rounded-xl transition-all ${
              isOver3 ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            {data.children[2] ? (
              <BlockRenderer
                block={data.children[2]}
                isSelected={selectedBlockId === data.children[2].id}
                onClick={() => {
                  selectBlock(data.children[2].id)
                  setActiveSidebarTab('style')
                }}
                onFormatRequest={onFormatRequest}
                onActiveStatesChange={onActiveStatesChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4">
                Drop a block here
              </div>
            )}
          </div>
        )}

        {/* Column 4 (if 4-column layout) */}
        {data.columns === 4 && (
          <div
            ref={setDropRef4}
            className={`min-h-[120px] border-2 border-dashed rounded-xl transition-all ${
              isOver4 ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            {data.children[3] ? (
              <BlockRenderer
                block={data.children[3]}
                isSelected={selectedBlockId === data.children[3].id}
                onClick={() => {
                  selectBlock(data.children[3].id)
                  setActiveSidebarTab('style')
                }}
                onFormatRequest={onFormatRequest}
                onActiveStatesChange={onActiveStatesChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4">
                Drop a block here
              </div>
            )}
          </div>
        )}
      </div>

      {isSelected && (
        <div className="mt-4 flex gap-2 justify-center">
          {data.columns < 4 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddColumn()
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              Add Column ({data.columns + 1} columns)
            </button>
          )}
          {data.columns > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveColumn()
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all shadow-sm"
            >
              Remove Column ({data.columns - 1} columns)
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(LayoutBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
