import { useState, useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { TemplateCategory, UserTemplate } from '@/types/email'
import { generateThumbnail } from '@/lib/thumbnailGenerator'

interface EditTemplateDialogProps {
  template: UserTemplate
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function EditTemplateDialog({ template, isOpen, onClose, onSuccess }: EditTemplateDialogProps) {
  const email = useEmailStore((state) => state.email)
  const updateUserTemplate = useEmailStore((state) => state.updateUserTemplate)

  const [name, setName] = useState(template.name)
  const [description, setDescription] = useState(template.description || '')
  const [category, setCategory] = useState<TemplateCategory>(template.category)
  const [tags, setTags] = useState(template.tags.join(', '))
  const [thumbnail, setThumbnail] = useState<string | null>(template.thumbnail || null)
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when template changes
  useEffect(() => {
    if (isOpen) {
      setName(template.name)
      setDescription(template.description || '')
      setCategory(template.category)
      setTags(template.tags.join(', '))
      setThumbnail(template.thumbnail || null)
      setError(null)
    }
  }, [isOpen, template])

  const handleRegenerateThumbnail = async () => {
    if (!email) return

    setIsRegeneratingThumbnail(true)
    setError(null)

    try {
      const thumbnailData = await generateThumbnail(email, {
        width: 320,
        quality: 0.7,
        scale: 0.5,
      })
      setThumbnail(thumbnailData)
    } catch (err) {
      console.error('Failed to regenerate thumbnail:', err)
      setError('Failed to regenerate thumbnail. Changes will still be saved.')
    } finally {
      setIsRegeneratingThumbnail(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const updates: Partial<Pick<UserTemplate, 'name' | 'description' | 'category' | 'tags'>> = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        tags: tagsArray,
      }

      updateUserTemplate(template.id, updates)

      // Success - close dialog and reset
      handleClose()
      onSuccess?.()
    } catch (err) {
      console.error('Failed to update template:', err)
      setError('Failed to update template. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }

  if (!isOpen) return null

  const categoryOptions: { value: TemplateCategory; label: string }[] = [
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'event', label: 'Event' },
    { value: 'update', label: 'Update' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Template</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Template Name */}
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g., Monthly Newsletter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/100 characters</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="template-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="template-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Optional description of this template..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="template-tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              id="template-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., monthly, blog, tech (comma-separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use commas to separate tags. Tags help with searching and filtering.
            </p>
          </div>

          {/* Thumbnail Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            {thumbnail ? (
              <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                <img
                  src={thumbnail}
                  alt="Template thumbnail"
                  className="w-full h-auto"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-500">No thumbnail available</p>
              </div>
            )}

            {/* Regenerate Thumbnail Button */}
            <button
              type="button"
              onClick={handleRegenerateThumbnail}
              disabled={isRegeneratingThumbnail || isSaving}
              className="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRegeneratingThumbnail ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Regenerating Thumbnail...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Regenerate Thumbnail</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ This will update the thumbnail with the current canvas content. Only use this if you've loaded and edited this template.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
