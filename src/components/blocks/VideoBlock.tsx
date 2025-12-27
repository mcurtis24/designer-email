import { useState } from 'react'
import type { EmailBlock, VideoBlockData } from '@/types/email'

interface VideoBlockProps {
  block: EmailBlock & { data: VideoBlockData }
  isSelected: boolean
  onClick: () => void
}

export default function VideoBlock({ block, isSelected, onClick }: VideoBlockProps) {
  const data = block.data as VideoBlockData
  const [imageError, setImageError] = useState(false)

  // Get alignment styles
  const alignmentMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }

  // Determine if it's a YouTube or Vimeo URL
  const isYouTube = data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be')
  const isVimeo = data.videoUrl.includes('vimeo.com')

  // Extract video ID for thumbnail if not provided
  const getVideoThumbnail = () => {
    if (data.thumbnailSrc) {
      return data.thumbnailSrc
    }

    if (isYouTube) {
      const videoId = extractYouTubeId(data.videoUrl)
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
    }

    if (isVimeo) {
      // Vimeo thumbnails require API call, so use placeholder
      return 'https://via.placeholder.com/640x360?text=Vimeo+Video'
    }

    return 'https://via.placeholder.com/640x360?text=Video+Thumbnail'
  }

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const thumbnail = getVideoThumbnail()
  const width = data.width || 560

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        padding: `${block.styles.padding?.top || '16px'} ${block.styles.padding?.right || '16px'} ${block.styles.padding?.bottom || '16px'} ${block.styles.padding?.left || '16px'}`,
        backgroundColor: block.styles.backgroundColor || 'transparent',
        display: 'flex',
        justifyContent: alignmentMap[data.alignment],
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: `${width}px`,
          maxWidth: '100%',
          borderRadius: data.borderRadius ? `${data.borderRadius}px` : '0',
        }}
      >
        {/* Video Thumbnail */}
        {!imageError && thumbnail ? (
          <img
            src={thumbnail}
            alt={data.alt || 'Video thumbnail'}
            className="w-full h-auto"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Hover Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
