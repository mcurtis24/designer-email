/**
 * Version History Modal
 * Shows timeline of email versions and allows restoration
 */

import { useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailVersion } from '@/types/email'

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VersionHistoryModal({ isOpen, onClose }: VersionHistoryModalProps) {
  const versions = useEmailStore((state) => state.getVersions())
  const versionManager = useEmailStore((state) => state.versionManager)
  const restoreVersion = useEmailStore((state) => state.restoreVersion)
  const deleteVersion = useEmailStore((state) => state.deleteVersion)
  const [selectedVersion, setSelectedVersion] = useState<EmailVersion | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRestore = (versionId: string) => {
    if (window.confirm('Restore this version? Your current work will be saved as a checkpoint.')) {
      restoreVersion(versionId)
      onClose()
    }
  }

  const handleDelete = (versionId: string) => {
    deleteVersion(versionId)
    setShowDeleteConfirm(null)
    if (selectedVersion?.id === versionId) {
      setSelectedVersion(null)
    }
  }

  const stats = versionManager.getStats(versions)

  // Group versions by type
  const manualVersions = versions.filter(v => v.type === 'manual' || v.type === 'checkpoint')
  const autoVersions = versions.filter(v => v.type === 'auto')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} version{stats.total === 1 ? '' : 's'} •
              {stats.manual} manual •
              {stats.auto} auto-save
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">No versions yet</p>
                <p className="text-sm mt-1">Versions will appear as you work</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* Manual/Checkpoint Versions */}
                {manualVersions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                      Manual Saves
                    </h3>
                    {manualVersions.map((version) => (
                      <VersionItem
                        key={version.id}
                        version={version}
                        versionManager={versionManager}
                        isSelected={selectedVersion?.id === version.id}
                        onSelect={() => setSelectedVersion(version)}
                        onRestore={() => handleRestore(version.id)}
                        onDelete={() => setShowDeleteConfirm(version.id)}
                        showDeleteConfirm={showDeleteConfirm === version.id}
                        onConfirmDelete={() => handleDelete(version.id)}
                        onCancelDelete={() => setShowDeleteConfirm(null)}
                      />
                    ))}
                  </div>
                )}

                {/* Auto Versions */}
                {autoVersions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                      Auto-Saves
                    </h3>
                    {autoVersions.map((version) => (
                      <VersionItem
                        key={version.id}
                        version={version}
                        versionManager={versionManager}
                        isSelected={selectedVersion?.id === version.id}
                        onSelect={() => setSelectedVersion(version)}
                        onRestore={() => handleRestore(version.id)}
                        onDelete={() => setShowDeleteConfirm(version.id)}
                        showDeleteConfirm={showDeleteConfirm === version.id}
                        onConfirmDelete={() => handleDelete(version.id)}
                        onCancelDelete={() => setShowDeleteConfirm(null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Version Details */}
          <div className="w-1/2 overflow-y-auto bg-gray-50">
            {selectedVersion ? (
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedVersion.type === 'manual' ? 'bg-blue-100 text-blue-700' :
                      selectedVersion.type === 'checkpoint' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedVersion.type === 'manual' ? 'Manual Save' :
                       selectedVersion.type === 'checkpoint' ? 'Checkpoint' :
                       'Auto-Save'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedVersion.message || 'Untitled Version'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {versionManager.formatFullTimestamp(selectedVersion.timestamp)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Blocks:</span>
                        <span className="ml-2 font-medium">{selectedVersion.blocks.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-2 font-medium">
                          {versionManager.calculateSize(selectedVersion.blocks)} KB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Block Types</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(
                        selectedVersion.blocks.reduce((acc, block) => {
                          acc[block.type] = (acc[block.type] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{type}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(selectedVersion.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Restore This Version
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Select a version to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Version Item Component
interface VersionItemProps {
  version: EmailVersion
  versionManager: any
  isSelected: boolean
  onSelect: () => void
  onRestore: () => void
  onDelete: () => void
  showDeleteConfirm: boolean
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

function VersionItem({
  version,
  versionManager,
  isSelected,
  onSelect,
  onRestore,
  onDelete,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: VersionItemProps) {
  return (
    <div
      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-transparent bg-white hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${
              version.type === 'manual' ? 'bg-blue-500' :
              version.type === 'checkpoint' ? 'bg-purple-500' :
              'bg-gray-400'
            }`} />
            <p className="text-sm font-medium text-gray-900 truncate">
              {version.message || 'Untitled'}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {versionManager.formatTimestamp(version.timestamp)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {version.blocks.length} blocks • {versionManager.calculateSize(version.blocks)} KB
          </p>
        </div>

        {!showDeleteConfirm ? (
          <div className="flex gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRestore()
              }}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Restore"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onConfirmDelete()
              }}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCancelDelete()
              }}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
