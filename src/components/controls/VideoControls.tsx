/**
 * Video Block Controls
 * Properties specific to video blocks
 */

import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, VideoBlockData } from '@/types/email'
import { AlignmentControl } from '@/components/controls/shared/AlignmentControl'
import { SizeControl } from '@/components/controls/shared/SizeControl'

interface VideoControlsProps {
  block: EmailBlock & { data: VideoBlockData }
}

export default function VideoControls({ block }: VideoControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const data = block.data as VideoBlockData

  const handleDataChange = (field: keyof VideoBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-3">
      {/* Video URL */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Video URL
        </label>
        <input
          type="url"
          value={data.videoUrl}
          onChange={(e) => handleDataChange('videoUrl', e.target.value)}
          placeholder="YouTube, Vimeo, or Cloudinary URL"
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          YouTube, Vimeo, or Cloudinary video URL
        </p>
      </div>

      {/* Thumbnail Image */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Thumbnail Image URL
        </label>
        <input
          type="url"
          value={data.thumbnailSrc}
          onChange={(e) => handleDataChange('thumbnailSrc', e.target.value)}
          placeholder="https://..."
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Fallback image for email clients (auto-fetched for YouTube)
        </p>
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Alt Text
        </label>
        <input
          type="text"
          value={data.alt}
          onChange={(e) => handleDataChange('alt', e.target.value)}
          placeholder="Describe the video content"
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Important for accessibility
        </p>
      </div>

      {/* Width */}
      <SizeControl
        label="Video Width"
        value={`${data.width || 560}px`}
        onChange={(value) => handleDataChange('width', parseInt(value))}
        min={200}
        max={640}
        step={10}
        unit="px"
      />

      {/* Alignment */}
      <AlignmentControl
        label="Alignment"
        value={data.alignment}
        onChange={(alignment) => handleDataChange('alignment', alignment)}
      />

      {/* Border Radius */}
      <SizeControl
        label="Border Radius"
        value={`${data.borderRadius || 0}px`}
        onChange={(value) => handleDataChange('borderRadius', parseInt(value))}
        min={0}
        max={50}
        step={2}
        unit="px"
      />
    </div>
  )
}
