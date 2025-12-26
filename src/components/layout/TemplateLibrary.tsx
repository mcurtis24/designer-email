/**
 * Template Library
 * Displays email templates with filtering and loading functionality
 */

import { useState, useRef } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { templates, type Template, getTemplateMetadata } from '@/lib/templates'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import PreviewModal from '@/components/ui/PreviewModal'
import TemplateThumbnail from '@/components/ui/TemplateThumbnail'
import TemplateCard from '@/components/ui/TemplateCard'
import type { EmailDocument } from '@/types/email'

type TabType = 'system' | 'user'

export default function TemplateLibrary() {
  const [activeTab, setActiveTab] = useState<TabType>('system')
  const [category, setCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewHTML, setPreviewHTML] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadTemplate = useEmailStore((state) => state.loadTemplate)
  const userTemplates = useEmailStore((state) => state.userTemplates)
  const importUserTemplate = useEmailStore((state) => state.importUserTemplate)

  // Filter system templates by category
  const filteredTemplates = category === 'all'
    ? templates
    : templates.filter((t) => getTemplateMetadata(t).category === category)

  // Get unique categories for system templates
  const categories = Array.from(new Set(templates.map((t) => getTemplateMetadata(t).category)))

  // Filter user templates by category and search
  const filteredUserTemplates = userTemplates.filter((template) => {
    const matchesCategory = category === 'all' || template.category === category
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  // Get unique categories from user templates
  const userCategories = Array.from(new Set(userTemplates.map((t) => t.category)))

  // Handle import template from JSON file
  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string
        importUserTemplate(jsonString)

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // Show success message
        alert('Template imported successfully!')
      } catch (error) {
        console.error('Failed to import template:', error)
        alert('Failed to import template. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

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
          contentWidth: 640,
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
          {activeTab === 'system'
            ? 'Start with a professionally designed template'
            : 'Your custom saved templates'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('system')
            setSearchQuery('')
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          System Templates
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {templates.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('user')
            setCategory('all')
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'user'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My Templates
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {userTemplates.length}
          </span>
        </button>
      </div>

      {/* User Templates: Search Bar + Import Button */}
      {activeTab === 'user' && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, description, or tags..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            className="hidden"
          />
        </div>
      )}

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
          All ({activeTab === 'system' ? templates.length : userTemplates.length})
        </button>
        {(activeTab === 'system' ? categories : userCategories).map((cat) => {
          const count = activeTab === 'system'
            ? templates.filter((t) => getTemplateMetadata(t).category === cat).length
            : userTemplates.filter((t) => t.category === cat).length

          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* System Templates Grid */}
      {activeTab === 'system' && (
        <>
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

          {/* Empty State for System Templates */}
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
        </>
      )}

      {/* User Templates Grid */}
      {activeTab === 'user' && (
        <>
          {userTemplates.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
              <h4 className="text-base font-medium text-gray-900 mb-2">No saved templates yet</h4>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                Create your first custom template by designing an email and clicking "Save as Template" in the top navigation
              </p>
              <button
                onClick={() => setActiveTab('system')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Browse system templates
              </button>
            </div>
          ) : filteredUserTemplates.length === 0 ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-sm text-gray-500 mb-2">No templates match your search</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCategory('all')
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUserTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </>
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
