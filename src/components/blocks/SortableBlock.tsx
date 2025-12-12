/**
 * Sortable Block Wrapper
 * Makes blocks draggable and sortable within the canvas
 * Includes inline block controls similar to Designer Email
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { EmailBlock } from '@/types/email'
import BlockRenderer from './BlockRenderer'
import { useEmailStore } from '@/stores/emailStore'

interface SortableBlockProps {
  block: EmailBlock
  isSelected: boolean
  onClick: () => void
  onFormatRequest?: (handler: (command: string, value?: string) => void) => void
  onActiveStatesChange?: (states: { isBold: boolean; isItalic: boolean; isUnderline: boolean }) => void
}

export default function SortableBlock({ block, isSelected, onClick, onFormatRequest, onActiveStatesChange }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const deleteBlock = useEmailStore((state) => state.deleteBlock)
  const duplicateBlock = useEmailStore((state) => state.duplicateBlock)
  const moveBlockUp = useEmailStore((state) => state.moveBlockUp)
  const moveBlockDown = useEmailStore((state) => state.moveBlockDown)
  const blocks = useEmailStore((state) => state.email.blocks)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const blockIndex = blocks.findIndex((b) => b.id === block.id)
  const canMoveUp = blockIndex > 0
  const canMoveDown = blockIndex < blocks.length - 1

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this block?')) {
      deleteBlock(block.id)
    }
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateBlock(block.id)
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canMoveUp) {
      moveBlockUp(block.id)
    }
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canMoveDown) {
      moveBlockDown(block.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group mb-2 transition-all duration-150 ease-out hover:shadow-md rounded"
    >
      {/* Inline Block Controls - Similar to Designer Email */}
      {isSelected && (
        <div className="absolute -top-9 right-0 flex items-center gap-1 bg-white border border-gray-200 rounded shadow-sm p-1 z-30">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          {/* Move Up */}
          <button
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Move Down */}
          <button
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Duplicate */}
          <button
            onClick={handleDuplicate}
            className="p-1 hover:bg-gray-100 rounded"
            title="Duplicate"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Block Content */}
      <BlockRenderer
        block={block}
        isSelected={isSelected}
        onClick={onClick}
        onFormatRequest={onFormatRequest}
        onActiveStatesChange={onActiveStatesChange}
      />
    </div>
  )
}
