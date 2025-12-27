import { useState } from 'react'
import { UserTemplate } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import EditTemplateDialog from './EditTemplateDialog'
import { TemplateVersionHistory } from './TemplateVersionHistory'

interface TemplateCardProps {
  template: UserTemplate
  onLoadTemplate?: (template: UserTemplate) => void
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
}

export default function TemplateCard({
  template,
  onLoadTemplate,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}: TemplateCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  const deleteUserTemplate = useEmailStore((state) => state.deleteUserTemplate)
  const duplicateUserTemplate = useEmailStore((state) => state.duplicateUserTemplate)
  const exportUserTemplate = useEmailStore((state) => state.exportUserTemplate)
  const loadUserTemplate = useEmailStore((state) => state.loadUserTemplate)

  const handleLoad = () => {
    if (confirm(`Load "${template.name}"? This will replace your current email.`)) {
      loadUserTemplate(template.id)
      onLoadTemplate?.(template)
    }
  }

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelection?.()
    } else {
      handleLoad()
    }
  }

  const handleDelete = () => {
    deleteUserTemplate(template.id)
    setShowDeleteConfirm(false)
  }

  const handleDuplicate = async () => {
    await duplicateUserTemplate(template.id)
  }

  const handleExport = () => {
    const jsonString = exportUserTemplate(template.id)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-template.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transactional':
        return 'bg-blue-100 text-blue-800'
      case 'newsletter':
        return 'bg-purple-100 text-purple-800'
      case 'promotion':
        return 'bg-red-100 text-red-800'
      case 'announcement':
        return 'bg-yellow-100 text-yellow-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'welcome':
        return 'bg-teal-100 text-teal-800'
      case 'update':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div
        className="relative border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all group bg-white"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Live Template Preview */}
        <div
          className="relative w-full bg-gray-50 cursor-pointer overflow-hidden"
          style={{ height: '280px' }}
          onClick={handleCardClick}
        >
          {/* Render actual template blocks */}
          <div
            className="absolute inset-0"
            style={{
              transform: 'scale(0.44)',
              transformOrigin: 'top center',
              width: `${template.settings.contentWidth}px`,
              left: '50%',
              marginLeft: `-${template.settings.contentWidth / 2}px`,
            }}
          >
            <div
              style={{
                width: `${template.settings.contentWidth}px`,
                backgroundColor: template.settings.backgroundColor,
                minHeight: '600px',
              }}
            >
              {template.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={false}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Overlay gradient for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />

          {/* Category Badge */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-md capitalize shadow-sm ${getCategoryColor(
              template.category
            )}`}
          >
            {template.category}
          </span>

          {/* Source Badge (User Created) / Checkbox */}
          {selectionMode ? (
            <div className="absolute top-3 left-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelection?.()
                }}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-md bg-white text-gray-700 shadow-sm border border-gray-200">
              My Template
            </span>
          )}

          {/* Hover Overlay */}
          {!selectionMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-white text-sm font-medium">Click to load</div>
            </div>
          )}
        </div>

        {/* Template Info */}
        <div className="p-3 bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate" title={template.name}>
            {template.name}
          </h4>

          {template.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={template.description}>
              {template.description}
            </p>
          )}

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Usage Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {template.lastUsedAt ? formatDate(template.lastUsedAt) : 'Never used'}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {template.useCount} {template.useCount === 1 ? 'use' : 'uses'}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleLoad}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Use Template
          </button>

          {/* Secondary Actions - Show on Hover */}
          {showActions && (
            <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditDialog(true)
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                title="Edit template"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowVersionHistory(true)
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                title="Version history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicate()
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                title="Duplicate template"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleExport()
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                title="Export as JSON"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(true)
                }}
                className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition-colors"
                title="Delete template"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Template Dialog */}
      <EditTemplateDialog
        template={template}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={() => {
          setShowEditDialog(false)
          // Template will automatically update in the grid via store reactivity
        }}
      />

      {/* Version History Modal */}
      {showVersionHistory && (
        <TemplateVersionHistory
          templateId={template.id}
          templateName={template.name}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete Template?</h3>
            <p className="text-sm text-gray-600 mb-1">
              This will permanently delete <strong>{template.name}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
