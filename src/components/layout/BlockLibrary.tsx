import { useDraggable } from '@dnd-kit/core'
import { ReactNode } from 'react'

interface DraggableBlockItemProps {
  id: string
  icon: ReactNode
  label: string
}

function DraggableBlockItem({ id, icon, label }: DraggableBlockItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="text-gray-600 mb-2">{icon}</div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </div>
  )
}

export default function BlockLibrary() {
  const contentBlocks = [
    {
      id: 'heading',
      label: 'Heading',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    {
      id: 'text',
      label: 'Text',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    },
    {
      id: 'image',
      label: 'Image',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'imageGallery',
      label: 'Gallery',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      )
    },
    {
      id: 'button',
      label: 'Button',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    {
      id: 'spacer',
      label: 'Spacer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    },
    {
      id: 'divider',
      label: 'Divider',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      )
    },
    {
      id: 'layout',
      label: 'Columns',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          TEXT
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {contentBlocks.slice(0, 2).map((block) => (
            <DraggableBlockItem
              key={block.id}
              id={block.id}
              icon={block.icon}
              label={block.label}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          MEDIA
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {contentBlocks.slice(2, 4).map((block) => (
            <DraggableBlockItem
              key={block.id}
              id={block.id}
              icon={block.icon}
              label={block.label}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          LAYOUT
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {contentBlocks.slice(4, 8).map((block) => (
            <DraggableBlockItem
              key={block.id}
              id={block.id}
              icon={block.icon}
              label={block.label}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
