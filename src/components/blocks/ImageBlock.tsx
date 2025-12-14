import { useState, useRef, useEffect, memo } from 'react'
import type { EmailBlock, ImageBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'
import { ImagePickerModal } from '@/components/ui/ImagePickerModal'

interface ImageBlockProps {
  block: EmailBlock & { data: ImageBlockData }
  isSelected?: boolean
  onClick?: () => void
}

function ImageBlock({ block, isSelected, onClick }: ImageBlockProps) {
  const { data, styles } = block
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined)
  const [hasSetInitialDimensions, setHasSetInitialDimensions] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleImageSelect = (url: string, publicId?: string) => {
    setHasSetInitialDimensions(false)
    setImageAspectRatio(undefined)
    updateBlock(block.id, {
      data: {
        ...data,
        src: url,
        alt: data.alt || 'Image',
      },
    })
  }

  // Calculate aspect ratio when image loads
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth) {
      const newAspectRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight

      if (newAspectRatio !== imageAspectRatio) {
        setImageAspectRatio(newAspectRatio)
      }
    }
  }, [data.src, imageAspectRatio])

  const handleImageLoad = () => {
    if (imgRef.current && !hasSetInitialDimensions) {
      const aspectRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight

      if (aspectRatio !== imageAspectRatio) {
        setImageAspectRatio(aspectRatio)
      }

      // Only set dimensions once when the image first loads
      if (!data.width || data.width === 0) {
        const newWidth = Math.min(imgRef.current.naturalWidth, 640)

        updateBlock(block.id, {
          data: {
            ...data,
            width: newWidth,
          },
        })

        setHasSetInitialDimensions(true)
      }
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
    setActiveSidebarTab('style')
  }

  const imageElement = (
    <img
      ref={imgRef}
      src={data.src}
      alt={data.alt}
      onLoad={handleImageLoad}
      style={{
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        maxWidth: '100%',
        margin: '0',
        padding: '0',
        border: 'none',
        display: 'block',
        lineHeight: '0',
        borderRadius: data.borderRadius ? `${data.borderRadius}px` : '0',
      }}
      className="h-auto object-cover"
    />
  )

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        paddingTop: styles.padding?.top,
        paddingRight: styles.padding?.right,
        paddingBottom: styles.padding?.bottom,
        paddingLeft: styles.padding?.left,
        backgroundColor: styles.backgroundColor,
        border: 'none',
        lineHeight: '0',
        textAlign: data.alignment,
      }}
    >
      {data.src && data.src !== '/placeholder.svg' && data.src !== '' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            lineHeight: '0',
            margin: '0',
            padding: '0',
          }}
          className="relative"
        >
          {data.linkUrl ? (
            <a href={data.linkUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.preventDefault()}>
              {imageElement}
            </a>
          ) : (
            imageElement
          )}
          {isSelected && (
            <>
              {/* Change Image Button */}
              <div className="absolute bottom-2 right-2 flex gap-2" style={{ zIndex: 10 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowImagePicker(true)
                  }}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center w-full flex flex-col items-center justify-center transition-all"
          style={{ margin: '0', minHeight: '200px' }}
        >
          {/* Image Icon */}
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Add Image Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowImagePicker(true)
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Add Image
          </button>
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelect={handleImageSelect}
        title="Select Image"
      />
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(ImageBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
