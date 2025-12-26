import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useState, ReactNode } from 'react'
import TopNav from './TopNav'
import Canvas from './Canvas'
import RightSidebar from './RightSidebar'
import { useEmailStore } from '@/stores/emailStore'
import { createBlock } from '@/lib/blockDefaults'
import type { BlockType } from '@/types/email'
import BlockRenderer from '@/components/blocks/BlockRenderer'

// Block type metadata for drag overlay
const blockMetadata: Record<string, { label: string; icon: ReactNode }> = {
  heading: {
    label: 'Heading',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    )
  },
  text: {
    label: 'Text',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    )
  },
  image: {
    label: 'Image',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  imageGallery: {
    label: 'Gallery',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    )
  },
  button: {
    label: 'Button',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    )
  },
  spacer: {
    label: 'Spacer',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  },
  divider: {
    label: 'Divider',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    )
  },
  layout: {
    label: 'Columns',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    )
  },
  footer: {
    label: 'Footer',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  },
}

export default function EditorLayout() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(false)
  const addBlock = useEmailStore((state) => state.addBlock)
  const addBlockAtIndex = useEmailStore((state) => state.addBlockAtIndex)
  const blocks = useEmailStore((state) => state.email.blocks)
  const reorderBlocks = useEmailStore((state) => state.reorderBlocks)
  const addBlockToLayoutColumn = useEmailStore((state) => state.addBlockToLayoutColumn)

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string
    setActiveId(activeId)

    // Check if dragging from library (not an existing block)
    const isExistingBlock = blocks.some((b) => b.id === activeId)
    setIsDraggingFromLibrary(!isExistingBlock)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    // Check if dragging an asset
    const isAsset = activeIdStr.startsWith('asset:')
    const assetData = isAsset ? active.data?.current?.asset : null

    // Check if we're dropping into a layout column
    if (overIdStr.includes('-col-')) {
      // Parse layout block ID and column index from drop zone ID
      // Format: {layoutBlockId}-col-{columnIndex}
      const parts = overIdStr.split('-col-')
      const layoutBlockId = parts[0]
      const columnIndex = parseInt(parts[1], 10)

      // Only handle new blocks from library for now
      const activeBlock = blocks.find((b) => b.id === active.id)
      if (!activeBlock) {
        let newBlock
        if (isAsset && assetData) {
          // Create ImageBlock with asset URL
          newBlock = createBlock('image', 0)
          newBlock.data = {
            ...newBlock.data,
            src: assetData.url,
            alt: assetData.filename || 'Image'
          }
        } else {
          const blockType = active.id as BlockType
          newBlock = createBlock(blockType, 0) // Order doesn't matter for nested blocks
        }
        addBlockToLayoutColumn(layoutBlockId, columnIndex, newBlock)
      }

      setActiveId(null)
      setIsDraggingFromLibrary(false)
      return
    }

    // Check if dropping into a drop zone between blocks
    if (overIdStr.startsWith('drop-zone-')) {
      const insertIndex = parseInt(overIdStr.replace('drop-zone-', ''), 10)

      // Only handle new blocks from library
      const activeBlock = blocks.find((b) => b.id === active.id)
      if (!activeBlock) {
        let newBlock
        if (isAsset && assetData) {
          // Create ImageBlock with asset URL
          newBlock = createBlock('image', insertIndex)
          newBlock.data = {
            ...newBlock.data,
            src: assetData.url,
            alt: assetData.filename || 'Image'
          }
        } else {
          const blockType = active.id as BlockType
          newBlock = createBlock(blockType, insertIndex)
        }
        addBlockAtIndex(newBlock, insertIndex)
      }

      setActiveId(null)
      setIsDraggingFromLibrary(false)
      return
    }

    // Check if we're reordering blocks within the canvas
    const activeBlock = blocks.find((b) => b.id === active.id)
    const overBlock = blocks.find((b) => b.id === over.id)

    if (activeBlock && overBlock && active.id !== over.id) {
      // Reordering blocks within canvas
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)

      reorderBlocks(oldIndex, newIndex)
    } else if (!activeBlock && overBlock) {
      // Adding new block from library - insert at position of block we're over
      const insertIndex = blocks.findIndex((b) => b.id === over.id)
      let newBlock
      if (isAsset && assetData) {
        // Create ImageBlock with asset URL
        newBlock = createBlock('image', insertIndex)
        newBlock.data = {
          ...newBlock.data,
          src: assetData.url,
          alt: assetData.filename || 'Image'
        }
      } else {
        const blockType = active.id as BlockType
        newBlock = createBlock(blockType, insertIndex)
      }
      addBlockAtIndex(newBlock, insertIndex)
    } else if (over.id === 'canvas-drop-zone' && !activeBlock) {
      // Adding new block from library to canvas
      let newBlock
      if (isAsset && assetData) {
        // Create ImageBlock with asset URL
        newBlock = createBlock('image', blocks.length)
        newBlock.data = {
          ...newBlock.data,
          src: assetData.url,
          alt: assetData.filename || 'Image'
        }
      } else {
        const blockType = active.id as BlockType
        newBlock = createBlock(blockType, blocks.length)
      }

      // Add the block to the store
      addBlock(newBlock)
    }

    setActiveId(null)
    setIsDraggingFromLibrary(false)
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={{ threshold: { x: 0.2, y: 0.2 } }}
    >
      <div className="flex flex-col h-full">
        {/* Top Navigation */}
        <TopNav />

        {/* Main Editor Area - Two Panel Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center - Canvas */}
          <main className="flex-1 canvas bg-gray-50">
            <Canvas isDraggingFromLibrary={isDraggingFromLibrary} />
          </main>

          {/* Right Sidebar - Tabbed Interface */}
          <RightSidebar />
        </div>
      </div>

      {/* Drag Overlay - shows what's being dragged */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (() => {
          const activeIdStr = String(activeId)

          // Check if dragging an asset
          if (activeIdStr.startsWith('asset:')) {
            // Show asset thumbnail preview
            return (
              <div className="w-32 h-32 rounded-lg border-2 border-blue-500 bg-white shadow-2xl opacity-90 cursor-grabbing transform scale-105 transition-transform overflow-hidden">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs font-medium text-center py-1">
                    Drop to add image
                  </div>
                </div>
              </div>
            )
          }

          // Check if dragging an existing block from canvas
          const existingBlock = blocks.find((b) => b.id === activeId)

          if (existingBlock) {
            // Show actual block preview with reduced opacity
            return (
              <div className="opacity-60 pointer-events-none" style={{ width: '600px' }}>
                <BlockRenderer
                  block={existingBlock}
                  isSelected={false}
                  onClick={() => {}}
                />
              </div>
            )
          }

          // Dragging from library - show icon and label
          return (
            <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-blue-500 bg-white shadow-2xl opacity-90 cursor-grabbing transform scale-105 transition-transform">
              <div className="text-blue-600 mb-2">
                {blockMetadata[activeId]?.icon || (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-700">
                {blockMetadata[activeId]?.label || activeId}
              </span>
            </div>
          )
        })() : null}
      </DragOverlay>
    </DndContext>
  )
}
