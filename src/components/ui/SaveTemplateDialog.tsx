import { useState, useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { TemplateCategory } from '@/types/email'
import { generateThumbnail } from '@/lib/thumbnailGenerator'

interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function SaveTemplateDialog({ isOpen, onClose, onSuccess }: SaveTemplateDialogProps) {
  const email = useEmailStore((state) => state.email)
  const saveEmailAsTemplate = useEmailStore((state) => state.saveEmailAsTemplate)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('newsletter')
  const [tags, setTags] = useState('')
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate thumbnail when dialog opens
  useEffect(() => {
    if (isOpen && email && !thumbnail) {
      generatePreviewThumbnail()
    }
  }, [isOpen, email])

  const generatePreviewThumbnail = async () => {
    if (!email) return

    setIsGeneratingThumbnail(true)
    setError(null)

    try {
      const thumbnailData = await generateThumbnail(email, {
        width: 320,
        quality: 0.7,
        scale: 0.5,
      })
      setThumbnail(thumbnailData)
    } catch (err) {
      console.error('Failed to generate preview thumbnail:', err)
      setError('Failed to generate preview. You can still save the template.')
    } finally {
      setIsGeneratingThumbnail(false)
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

      await saveEmailAsTemplate(name.trim(), category, description.trim() || undefined, tagsArray)

      // Success - close dialog and reset
      handleClose()
      onSuccess?.()
    } catch (err) {
      console.error('Failed to save template:', err)
      setError('Failed to save template. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setCategory('newsletter')
    setTags('')
    setThumbnail(null)
    setError(null)
    onClose()
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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Save as Template</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isSaving}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Preview Thumbnail */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="flex justify-center items-center min-h-[180px] bg-white rounded-md border border-gray-200">
                {isGeneratingThumbnail ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Generating preview...</p>
                  </div>
                ) : thumbnail ? (
                  <img src={thumbnail} alt="Template preview" className="max-w-full h-auto rounded-md shadow-sm" />
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Preview unavailable</p>
                  </div>
                )}
              </div>
            </div>

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
                placeholder="e.g., Monthly Newsletter, Product Launch"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSaving}
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="template-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
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
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this template is for and when to use it..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={isSaving}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="template-tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="template-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., marketing, seasonal, weekly"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSaving}
              />
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
