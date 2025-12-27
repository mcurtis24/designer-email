import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useEmailStore } from '@/stores/emailStore'
import SortableBlock from '@/components/blocks/SortableBlock'
import DropZoneBetween from '@/components/blocks/DropZoneBetween'
import CanvasToolbar from './CanvasToolbar'

interface CanvasProps {
  isDraggingFromLibrary?: boolean
}

export default function Canvas({ isDraggingFromLibrary = false }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  })

  const blocks = useEmailStore((state) => state.email.blocks)
  const viewportMode = useEmailStore((state) => state.editorState.viewport.mode)
  const zoom = useEmailStore((state) => state.editorState.viewport.zoom)
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const selectBlock = useEmailStore((state) => state.selectBlock)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)
  const editingBlockId = useEmailStore((state) => state.editorState.editingBlockId)
  const editingType = useEmailStore((state) => state.editorState.editingType)

  const [activeStates, setActiveStates] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
  })
  const formatHandlerRef = useRef<((command: string, value?: string) => void) | null>(null)

  // Sort blocks by order for consistent display
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
  const blockIds = sortedBlocks.map((block) => block.id)

  // Determine canvas width based on viewport mode
  const canvasWidth = viewportMode === 'mobile' ? 375 : 640
  const zoomScale = zoom / 100

  // Find the currently editing block (including nested blocks in layouts)
  const editingBlock = editingBlockId ? (() => {
    // First check top-level blocks
    const topLevelBlock = blocks.find((b) => b.id === editingBlockId)
    if (topLevelBlock) return topLevelBlock

    // If not found, search inside layout blocks' children
    for (const block of blocks) {
      if (block.type === 'layout') {
        const layoutData = block.data as any
        const childBlock = layoutData.children.find((child: any) => child.id === editingBlockId)
        if (childBlock) return childBlock
      }
    }

    return null
  })() : null

  // Callbacks for format handler and active states from editing blocks
  const handleFormatRequest = (handler: (command: string, value?: string) => void) => {
    formatHandlerRef.current = handler
  }

  const handleActiveStatesChange = (states: { isBold: boolean; isItalic: boolean; isUnderline: boolean }) => {
    setActiveStates(states)
  }

  // Wrapper to call the format handler if it exists
  const handleFormat = (command: string, value?: string) => {
    if (formatHandlerRef.current) {
      formatHandlerRef.current(command, value)
    }
  }

  // Handle clicking outside the canvas
  const handleOutsideClick = (e: React.MouseEvent) => {
    // Check if click is outside the white canvas box
    const target = e.target as HTMLElement
    const clickedOnCanvas = target.closest('.bg-white.shadow-lg')
    const clickedOnToolbar = target.closest('.canvas-toolbar')

    // Don't deselect if clicking on canvas or toolbar
    if (!clickedOnCanvas && !clickedOnToolbar) {
      selectBlock(null)
      setActiveSidebarTab('blocks')
    }
  }

  // Handle clicking on canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only handle clicks on the canvas background itself, not on blocks
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.p-6')) {
      selectBlock(null)
      setActiveSidebarTab('blocks')
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center overflow-auto bg-gray-100" onClick={handleOutsideClick}>
      {/* Email Canvas with Zoom */}
      <div className="w-full flex flex-col items-center relative">
        {/* Canvas Toolbar - Shows when editing text/heading */}
        {editingBlock && editingType && (
          <div className="canvas-toolbar sticky top-2 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <CanvasToolbar
                block={editingBlock}
                onFormat={handleFormat}
                activeStates={activeStates}
              />
            </div>
          </div>
        )}

        <div
          className="mt-16"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <div
            ref={setNodeRef}
            className={`bg-white rounded-lg overflow-visible transition-all ${
              isOver ? 'ring-4 ring-blue-300' : ''
            } ${
              viewportMode === 'mobile' ? 'ring-4 ring-blue-500 shadow-[0_0_0_8px_rgba(59,130,246,0.1)]' : ''
            }`}
            style={{
              width: `${canvasWidth}px`,
              minHeight: '640px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Email Content Area */}
            <div className="pb-12" onClick={handleCanvasClick}>
              {blocks.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                  <p className="text-lg mb-2">Drag blocks from the right to get started</p>
                  <p className="text-sm flex items-center justify-center gap-2">
                    <span>→</span>
                  </p>
                </div>
              ) : (
                <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0">
                    {/* Drop zone before first block */}
                    <DropZoneBetween index={0} isVisible={isDraggingFromLibrary} />

                    {sortedBlocks.map((block, idx) => (
                      <div key={block.id}>
                        <SortableBlock
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onClick={() => selectBlock(block.id)}
                          onFormatRequest={handleFormatRequest}
                          onActiveStatesChange={handleActiveStatesChange}
                        />
                        {/* Drop zone after each block */}
                        <DropZoneBetween
                          index={idx + 1}
                          isVisible={isDraggingFromLibrary}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Mode Indicator */}
        {viewportMode === 'mobile' && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile Preview (375px)
          </div>
        )}
      </div>
    </div>
  )
}
