/**
 * Recently Used Component
 * Horizontal scroll of recently used blocks
 * Part of Canva-inspired UI redesign
 */

import { useDraggable } from '@dnd-kit/core'
import { ReactNode } from 'react'

interface RecentBlock {
  id: string
  label: string
  icon: ReactNode
}

interface RecentlyUsedProps {
  blocks: RecentBlock[]
}

function RecentBlockItem({ id, icon, label }: RecentBlock) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex-shrink-0 w-20 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="text-gray-600 mb-1">{icon}</div>
      <span className="text-xs font-medium text-gray-700 text-center line-clamp-1">
        {label}
      </span>
    </div>
  )
}

export default function RecentlyUsed({ blocks }: RecentlyUsedProps) {
  if (blocks.length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Recently Used
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {blocks.map((block) => (
          <RecentBlockItem
            key={block.id}
            id={block.id}
            icon={block.icon}
            label={block.label}
          />
        ))}
      </div>
    </div>
  )
}
