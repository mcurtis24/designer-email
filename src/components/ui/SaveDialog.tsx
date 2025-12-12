/**
 * Save Dialog
 * Prompt for manual save with custom message
 */

import { useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'

interface SaveDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function SaveDialog({ isOpen, onClose }: SaveDialogProps) {
  const [message, setMessage] = useState('')
  const createVersion = useEmailStore((state) => state.createVersion)
  const blocks = useEmailStore((state) => state.email.blocks)

  if (!isOpen) return null

  const handleSave = () => {
    const saveMessage = message.trim() || `Manual save - ${new Date().toLocaleString()}`
    createVersion('manual', saveMessage)
    setMessage('')
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Save Version</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 'Before changing color scheme', 'Final draft', etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to save, Escape to cancel
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Blocks to save:</span>
            <span className="font-medium text-gray-900">{blocks.length}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Version
          </button>
        </div>
      </div>
    </div>
  )
}
