import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { memo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { GalleryImage } from '@/types/email'

interface SortableGalleryImageProps {
  id: string
  image: GalleryImage
  index: number
  isSelected: boolean
  uploadingIndex: number | null
  onRemove: (index: number, e: React.MouseEvent) => void
  onChange: (index: number) => void
}

const SortableGalleryImage = memo(function SortableGalleryImage({
  id,
  image,
  index,
  isSelected,
  uploadingIndex,
  onRemove,
  onChange,
}: SortableGalleryImageProps) {
  const setSelectedGalleryImageIndex = useEmailStore((state) => state.setSelectedGalleryImageIndex)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !image.src || uploadingIndex === index || !isSelected
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderRadius: image.borderRadius ? `${image.borderRadius}px` : '0'
      }}
      {...attributes}
      className="relative aspect-square overflow-hidden bg-gray-100 border border-gray-200 group"
    >
      {image.src ? (
        <>
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            onClick={(e) => {
              if (isSelected) {
                e.stopPropagation()
                setSelectedGalleryImageIndex(index) // Sync with sidebar
                onChange(index)
              }
              // If not selected, let click bubble up to select the block
            }}
            style={{
              cursor: isSelected ? 'pointer' : 'default',
              borderRadius: image.borderRadius ? `${image.borderRadius}px` : '0',
              objectPosition: image.objectPosition || '50% 50%'
            }}
            title={isSelected ? 'Click to change image' : ''}
          />
          {/* Drag handle overlay - only when selected and has image */}
          {isSelected && (
            <div
              {...listeners}
              className="absolute inset-0 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center"
              title="Drag to reorder"
            >
              <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-700 shadow-md pointer-events-none">
                Drag to reorder
              </div>
            </div>
          )}
          {/* Small red X delete button */}
          {isSelected && (
            <button
              onClick={(e) => onRemove(index, e)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md flex items-center justify-center opacity-80 hover:opacity-100 z-10"
              title="Remove image"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </>
      ) : (
        <>
          <div className="w-full h-full flex flex-col items-center justify-center transition-colors p-4">
            {uploadingIndex === index ? (
              <div className="text-gray-400 text-sm">Uploading...</div>
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedGalleryImageIndex(index) // Sync with sidebar
                    onChange(index)
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </>
            )}
          </div>
          {/* Small red X delete button for empty slots */}
          {isSelected && (
            <button
              onClick={(e) => onRemove(index, e)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md flex items-center justify-center opacity-80 hover:opacity-100 z-10"
              title="Remove slot"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
})

export default SortableGalleryImage
