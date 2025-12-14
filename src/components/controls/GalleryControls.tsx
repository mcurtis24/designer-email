import type { EmailBlock, ImageGalleryBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface GalleryControlsProps {
  block: EmailBlock & { data: ImageGalleryBlockData }
}

export default function GalleryControls({ block }: GalleryControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const selectedImageIndex = useEmailStore((state) => state.editorState.selectedGalleryImageIndex)
  const setSelectedImageIndex = useEmailStore((state) => state.setSelectedGalleryImageIndex)

  const handleLayoutChange = (layout: '2-col' | '3-col' | '4-col') => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        layout,
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleLayoutChange('2-col')}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.layout === '2-col'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            2 Col
          </button>
          <button
            onClick={() => handleLayoutChange('3-col')}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.layout === '3-col'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            3 Col
          </button>
          <button
            onClick={() => handleLayoutChange('4-col')}
            className={`px-3 py-2 text-sm border rounded transition-colors ${
              block.data.layout === '4-col'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            4 Col
          </button>
        </div>
      </div>

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

      {/* Stack on Mobile Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.data.stackOnMobile !== false}
            onChange={(e) => {
              updateBlock(block.id, {
                data: {
                  ...block.data,
                  stackOnMobile: e.target.checked,
                },
              })
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Stack columns on mobile
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          When unchecked, images stay side-by-side on mobile (useful for social icons, small thumbnails)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Border Radius: {(block.data.images[0]?.borderRadius ?? 0)}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          step="2"
          value={block.data.images[0]?.borderRadius ?? 0}
          onChange={(e) => {
            const borderRadius = Number(e.target.value)
            updateBlock(block.id, {
              data: {
                ...block.data,
                images: block.data.images.map(img => ({
                  ...img,
                  borderRadius
                }))
              },
            })
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0px (Square)</span>
          <span>50px (Rounded)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Position
        </label>

        {/* Image selector */}
        {block.data.images.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mb-2">
              Select an image to reposition:
            </p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {block.data.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  title={`Image ${index + 1}`}
                >
                  {image.src ? (
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: image.objectPosition || '50% 50%' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Position grid */}
            <p className="text-xs text-gray-500 mb-2">
              Choose focal point for Image {selectedImageIndex + 1}:
            </p>
            <div className="grid grid-cols-3 gap-1 p-1.5 bg-gray-50 rounded border border-gray-200 w-32 mx-auto">
              {[
                { label: 'TL', position: '0% 0%', title: 'Top Left' },
                { label: 'T', position: '50% 0%', title: 'Top Center' },
                { label: 'TR', position: '100% 0%', title: 'Top Right' },
                { label: 'L', position: '0% 50%', title: 'Left' },
                { label: 'C', position: '50% 50%', title: 'Center' },
                { label: 'R', position: '100% 50%', title: 'Right' },
                { label: 'BL', position: '0% 100%', title: 'Bottom Left' },
                { label: 'B', position: '50% 100%', title: 'Bottom Center' },
                { label: 'BR', position: '100% 100%', title: 'Bottom Right' },
              ].map(({ label, position, title }) => {
                const currentPosition = block.data.images[selectedImageIndex]?.objectPosition || '50% 50%'
                const isActive = currentPosition === position

                return (
                  <button
                    key={label}
                    onClick={() => {
                      const newImages = [...block.data.images]
                      newImages[selectedImageIndex] = {
                        ...newImages[selectedImageIndex],
                        objectPosition: position
                      }

                      updateBlock(block.id, {
                        data: {
                          ...block.data,
                          images: newImages
                        },
                      })
                    }}
                    className={`aspect-square flex items-center justify-center text-[10px] font-medium rounded transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                    title={title}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images
        </label>
        <div className="text-sm text-gray-600">
          {block.data.images.length} image{block.data.images.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
