import { useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { TemplateVersion } from '@/types/email'
import { Clock, RotateCcw, X } from 'lucide-react'

interface TemplateVersionHistoryProps {
  templateId: string
  templateName: string
  onClose: () => void
}

export function TemplateVersionHistory({
  templateId,
  templateName,
  onClose,
}: TemplateVersionHistoryProps) {
  const getTemplateVersions = useEmailStore((state) => state.getTemplateVersions)
  const restoreTemplateVersion = useEmailStore((state) => state.restoreTemplateVersion)
  const [isRestoring, setIsRestoring] = useState(false)

  const versions = getTemplateVersions(templateId)

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this version? Your current template will be saved as a version before restoring.')) {
      return
    }

    setIsRestoring(true)
    try {
      restoreTemplateVersion(templateId, versionId)
      alert('Version restored successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Failed to restore version. Please try again.')
    } finally {
      setIsRestoring(false)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const formatFullTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-500 mt-1">{templateName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Version History</h3>
              <p className="text-sm text-gray-500">
                Versions will appear here when you update this template.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <VersionCard
                  key={version.id}
                  version={version}
                  isLatest={index === 0}
                  onRestore={handleRestore}
                  isRestoring={isRestoring}
                  formatTimestamp={formatTimestamp}
                  formatFullTimestamp={formatFullTimestamp}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Up to 10 versions are kept per template. Restoring a version will
            save your current state as a version first.
          </p>
        </div>
      </div>
    </div>
  )
}

interface VersionCardProps {
  version: TemplateVersion
  isLatest: boolean
  onRestore: (versionId: string) => void
  isRestoring: boolean
  formatTimestamp: (timestamp: Date) => string
  formatFullTimestamp: (timestamp: Date) => string
}

function VersionCard({
  version,
  isLatest,
  onRestore,
  isRestoring,
  formatTimestamp,
  formatFullTimestamp,
}: VersionCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isLatest
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">
              {formatTimestamp(version.timestamp)}
            </span>
            {isLatest && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                Latest
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2" title={formatFullTimestamp(version.timestamp)}>
            {formatFullTimestamp(version.timestamp)}
          </p>
          {version.message && (
            <p className="text-sm text-gray-600 italic">"{version.message}"</p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            <span>{version.blocks.length} blocks</span>
          </div>
        </div>

        {!isLatest && (
          <button
            onClick={() => onRestore(version.id)}
            disabled={isRestoring}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Restore
          </button>
        )}
      </div>
    </div>
  )
}
