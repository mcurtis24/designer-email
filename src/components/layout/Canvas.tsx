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
  const setViewportMode = useEmailStore((state) => state.setViewportMode)
  const setZoom = useEmailStore((state) => state.setZoom)
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const selectBlock = useEmailStore((state) => state.selectBlock)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)
  const clearAllBlocks = useEmailStore((state) => state.clearAllBlocks)
  const editingBlockId = useEmailStore((state) => state.editorState.editingBlockId)
  const editingType = useEmailStore((state) => state.editorState.editingType)

  const [showClearConfirm, setShowClearConfirm] = useState(false)
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
      </div>

      {/* Bottom Toolbar - Viewport Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex items-center justify-center gap-4 px-4 py-3">
          {/* Viewport Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewportMode === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Desktop
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewportMode === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile
            </button>
            <div className="text-sm text-gray-500 font-medium">
              {canvasWidth}px
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>

            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24"
            />

            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>

            <button
              onClick={() => setZoom(100)}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors min-w-[50px]"
              title="Reset zoom"
            >
              {zoom}%
            </button>
          </div>

          {blocks.length > 0 && (
            <>
              <div className="w-px h-6 bg-gray-300" />

              {/* Clear Canvas Button */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Clear all blocks"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Canvas
              </button>
            </>
          )}
        </div>
      </div>

      {/* Clear Canvas Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Clear Canvas?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all blocks? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllBlocks()
                  setShowClearConfirm(false)
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Blocks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
