/**
 * Template Library
 * Displays email templates with filtering and loading functionality
 */

import { useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { templates, type Template, getTemplateMetadata } from '@/lib/templates'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import PreviewModal from '@/components/ui/PreviewModal'
import type { EmailDocument } from '@/types/email'

export default function TemplateLibrary() {
  const [category, setCategory] = useState<string>('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewHTML, setPreviewHTML] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const loadTemplate = useEmailStore((state) => state.loadTemplate)

  // Filter templates by category
  const filteredTemplates = category === 'all'
    ? templates
    : templates.filter((t) => getTemplateMetadata(t).category === category)

  // Get unique categories
  const categories = Array.from(new Set(templates.map((t) => getTemplateMetadata(t).category)))

  const handlePreviewTemplate = (template: Template) => {
    try {
      const meta = getTemplateMetadata(template)

      // Create temporary email document with stock content (no placeholder stripping for preview)
      // Add order property to blocks
      const blocksWithOrder = template.blocks.map((block, index) => ({
        ...block,
        order: index
      }))

      const tempEmail: EmailDocument = {
        id: 'preview',
        title: meta.name,
        blocks: blocksWithOrder,
        settings: {
          backgroundColor: template.settings.backgroundColor || '#FFFFFF',
          contentWidth: 600, // Industry standard
          fontFamily: template.settings.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textColor: template.settings.textColor || '#1F2937',
          brandColors: template.settings.brandColors || []
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        metadata: {},
        history: []
      }

      // Generate HTML (no Outlook fallback for preview)
      const html = generateEmailHTML(tempEmail, false)

      // Open preview
      setPreviewTemplate(template)
      setPreviewHTML(html)
      setShowPreview(true)
    } catch (error) {
      console.error('Preview failed:', error)
      alert('Failed to preview template. Please try another.')
    }
  }

  const handleLoadTemplate = (template: Template) => {
    const meta = getTemplateMetadata(template)
    setShowPreview(false) // Close preview if open
    if (confirm(`Load "${meta.name}" template? This will replace your current email.`)) {
      loadTemplate(template)
    }
  }

  // Category badge colors
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
      case 'content':
        return 'bg-indigo-100 text-indigo-800'
      case 'retention':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Email Templates</h3>
        <p className="text-xs text-gray-500 mt-1">
          Start with a professionally designed template
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            category === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({templates.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat} ({templates.filter((t) => getTemplateMetadata(t).category === cat).length})
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTemplates.map((template) => {
          const meta = getTemplateMetadata(template)
          return (
            <div
              key={meta.id}
              onClick={() => handlePreviewTemplate(template)}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePreviewTemplate(template)
                }
              }}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{meta.name}</h4>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${getCategoryColor(
                    meta.category
                  )}`}
                >
                  {meta.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{meta.description}</p>

              {/* Tags */}
              {meta.tags && meta.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {meta.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview Hint */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                  Click to preview →
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">No templates found</p>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={previewHTML}
        title={previewTemplate ? getTemplateMetadata(previewTemplate).name : undefined}
        footer={
          previewTemplate && (
            <div className="flex justify-between items-center w-full">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                ← Back to Templates
              </button>
              <button
                onClick={() => handleLoadTemplate(previewTemplate)}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Use This Template
              </button>
            </div>
          )
        }
      />
    </div>
  )
}
