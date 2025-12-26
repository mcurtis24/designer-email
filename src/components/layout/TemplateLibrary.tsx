/**
 * Template Library
 * Displays email templates with filtering and loading functionality
 */

import { useState } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { templates, type Template, getTemplateMetadata } from '@/lib/templates'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import PreviewModal from '@/components/ui/PreviewModal'
import TemplateThumbnail from '@/components/ui/TemplateThumbnail'
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
          brandColors: (template.settings.brandColors || []).map((color, index) => ({
            color,
            order: index,
          })),
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
      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => {
          const meta = getTemplateMetadata(template)
          return (
            <div
              key={meta.id}
              className="relative border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              {/* Template Thumbnail - Clickable for Preview */}
              <div
                className="relative w-full bg-gray-50 cursor-pointer"
                style={{ height: '280px' }}
                onClick={() => handlePreviewTemplate(template)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handlePreviewTemplate(template)
                  }
                }}
              >
                <TemplateThumbnail template={template} className="w-full h-full" />

                {/* Category Badge */}
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-md capitalize shadow-sm ${getCategoryColor(
                    meta.category
                  )}`}
                >
                  {meta.category}
                </span>

                {/* Subtle Hover Overlay with Preview Hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Click to preview
                  </div>
                </div>
              </div>

              {/* Template Info & Actions - ALWAYS VISIBLE */}
              <div className="p-3 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 truncate">{meta.name}</h4>
                <button
                  onClick={() => handleLoadTemplate(template)}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use Template
                </button>
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
