import { useDroppable } from '@dnd-kit/core'

interface DropZoneBetweenProps {
  index: number
  isVisible: boolean
}

export default function DropZoneBetween({ index, isVisible }: DropZoneBetweenProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-zone-${index}`,
  })

  if (!isVisible) return null

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ease-out ${
        isOver ? 'h-16 my-2' : 'h-2 my-1'
      }`}
    >
      <div
        className={`w-full h-full rounded transition-all duration-200 ${
          isOver
            ? 'bg-blue-400 border-2 border-blue-500 border-dashed shadow-lg'
            : 'bg-blue-200 border border-blue-300 border-dashed opacity-60'
        }`}
      >
        {isOver && (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Drop here to insert
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
