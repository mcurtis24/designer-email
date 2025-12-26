import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useEmailStore } from '@/stores/emailStore'
import { SavedComponent } from '@/types/email'
import BlockRenderer from '@/components/blocks/BlockRenderer'

export default function SavedComponentsLibrary() {
  const savedComponents = useEmailStore((state) => state.savedComponents)
  const deleteSavedComponent = useEmailStore((state) => state.deleteSavedComponent)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (componentId: string) => {
    deleteSavedComponent(componentId)
    setDeleteConfirmId(null)
  }

  if (savedComponents.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-3">
          <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">No saved components yet</h3>
        <p className="text-xs text-gray-500 mb-3">
          Save blocks you use frequently to reuse them across emails
        </p>
        <div className="text-xs text-gray-400">
          Select a block and click "Save as Component" to get started
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Saved Components ({savedComponents.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {savedComponents.map((component) => (
          <DraggableComponent
            key={component.id}
            component={component}
            onDelete={() => setDeleteConfirmId(component.id)}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Delete Component?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove this component from your library. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DraggableComponentProps {
  component: SavedComponent
  onDelete: () => void
}

function DraggableComponent({ component, onDelete }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `saved-component:${component.id}`,
    data: {
      type: 'saved-component',
      component,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative group bg-white border-2 border-gray-200 rounded-lg overflow-hidden cursor-grab hover:border-blue-400 hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      }`}
    >
      {/* Live Block Preview */}
      <div className="relative h-24 bg-gray-50 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: 'scale(0.15)',
            transformOrigin: 'center center',
            width: '640px',
            height: 'auto',
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-320px',
            marginTop: '-120px',
          }}
        >
          <div style={{ width: '640px' }}>
            <BlockRenderer
              block={component.block}
              isSelected={false}
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      </div>

      {/* Component Info */}
      <div className="p-2 bg-white">
        <p className="text-xs font-medium text-gray-900 truncate" title={component.name}>
          {component.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {component.category && (
            <span className="inline-block px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">
              {component.category}
            </span>
          )}
          <span className="text-xs text-gray-500 capitalize">{component.block.type}</span>
        </div>
      </div>

      {/* Delete Button - appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-2 p-1 bg-white border border-gray-200 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm z-10"
        title="Delete component"
      >
        <svg className="w-3 h-3 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Drag hint - appears on hover */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full shadow-sm">
          Drag to canvas
        </span>
      </div>
    </div>
  )
}
