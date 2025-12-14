import { useState, memo } from 'react'
import type { EmailBlock, ImageGalleryBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'
import { ImagePickerModal } from '@/components/ui/ImagePickerModal'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import SortableGalleryImage from './SortableGalleryImage'

interface GalleryBlockProps {
  block: EmailBlock & { data: ImageGalleryBlockData }
  isSelected?: boolean
  onClick?: () => void
}

function GalleryBlock({ block, isSelected, onClick }: GalleryBlockProps) {
  const { data, styles } = block
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const handleImageSelect = (url: string, publicId?: string) => {
    if (uploadingIndex !== null) {
      const newImages = [...data.images]
      newImages[uploadingIndex] = {
        ...newImages[uploadingIndex],
        src: url,
        alt: newImages[uploadingIndex].alt || 'Gallery image',
      }

      updateBlock(block.id, {
        data: {
          ...data,
          images: newImages,
        },
      })
      setUploadingIndex(null)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag (prevents accidental drags)
      },
    })
  )

  const getGridColumns = () => {
    switch (data.layout) {
      case '2-col': return 2
      case '3-col': return 3
      case '4-col': return 4
      default: return 2
    }
  }

  const handleImageClick = async (index: number) => {
    setUploadingIndex(index)
    setShowImagePicker(true)
  }

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newImages = [...data.images]
    newImages.splice(index, 1)

    updateBlock(block.id, {
      data: {
        ...data,
        images: newImages,
      },
    })
  }

  const handleAddImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Get borderRadius from first existing image, or default to 0
    const borderRadius = data.images[0]?.borderRadius ?? 0
    const newImages = [
      ...data.images,
      { src: '', alt: `Gallery image ${data.images.length + 1}`, borderRadius },
    ]

    updateBlock(block.id, {
      data: {
        ...data,
        images: newImages,
      },
    })
  }

  const columns = getGridColumns()
  const gap = data.gap || 8

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
    setActiveSidebarTab('style')
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = data.images.findIndex((_, i) => `gallery-${block.id}-image-${i}` === active.id)
      const newIndex = data.images.findIndex((_, i) => `gallery-${block.id}-image-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(data.images, oldIndex, newIndex)

        updateBlock(block.id, {
          data: { ...data, images: newImages },
        })
      }
    }

    setActiveId(null)
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
        textAlign: styles.textAlign,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={data.images.map((_, i) => `gallery-${block.id}-image-${i}`)}
          strategy={rectSortingStrategy}
        >
          <div
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {data.images.map((image, index) => (
              <SortableGalleryImage
                key={`gallery-${block.id}-image-${index}`}
                id={`gallery-${block.id}-image-${index}`}
                image={image}
                index={index}
                isSelected={isSelected || false}
                uploadingIndex={uploadingIndex}
                onRemove={handleRemoveImage}
                onChange={handleImageClick}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay for visual feedback */}
        <DragOverlay>
          {activeId ? (
            <div
              className="aspect-square w-32 overflow-hidden bg-gray-100 border-2 border-blue-500 rounded-lg shadow-xl"
              style={{
                transform: 'translate(-200px, -200px)'
              }}
            >
              {data.images.find((_, i) => `gallery-${block.id}-image-${i}` === activeId)?.src && (
                <img
                  src={data.images.find((_, i) => `gallery-${block.id}-image-${i}` === activeId)!.src}
                  alt="Dragging"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isSelected && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleAddImage}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </button>
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => {
          setShowImagePicker(false)
          setUploadingIndex(null)
        }}
        onImageSelect={handleImageSelect}
        title="Select Gallery Image"
      />
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(GalleryBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
