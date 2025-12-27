/**
 * Template Library
 * Displays email templates with filtering and loading functionality
 */

import { useState, useRef, useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { templates, type Template, getTemplateMetadata } from '@/lib/templates'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import PreviewModal from '@/components/ui/PreviewModal'
import TemplateThumbnail from '@/components/ui/TemplateThumbnail'
import TemplateCard from '@/components/ui/TemplateCard'
import TemplateAnalyticsModal from '@/components/ui/TemplateAnalyticsModal'
import type { EmailDocument } from '@/types/email'

type TabType = 'system' | 'user'
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'most-used' | 'least-used'

export default function TemplateLibrary() {
  const [activeTab, setActiveTab] = useState<TabType>('system')
  const [category, setCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showPreview, setShowPreview] = useState(false)
  const [previewHTML, setPreviewHTML] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadTemplate = useEmailStore((state) => state.loadTemplate)
  const userTemplates = useEmailStore((state) => state.userTemplates)
  const importUserTemplate = useEmailStore((state) => state.importUserTemplate)
  const deleteMultipleTemplates = useEmailStore((state) => state.deleteMultipleTemplates)
  const exportMultipleTemplates = useEmailStore((state) => state.exportMultipleTemplates)

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

  // Sort filtered user templates
  const sortedUserTemplates = useMemo(() => {
    const templates = [...filteredUserTemplates]

    switch (sortBy) {
      case 'newest':
        return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'oldest':
        return templates.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'name-asc':
        return templates.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return templates.sort((a, b) => b.name.localeCompare(a.name))
      case 'most-used':
        return templates.sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      case 'least-used':
        return templates.sort((a, b) => (a.useCount || 0) - (b.useCount || 0))
      default:
        return templates
    }
  }, [filteredUserTemplates, sortBy])

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

  // Bulk operation handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedTemplateIds([]) // Clear selections when toggling mode
  }

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    )
  }

  const selectAllTemplates = () => {
    setSelectedTemplateIds(sortedUserTemplates.map((t) => t.id))
  }

  const deselectAllTemplates = () => {
    setSelectedTemplateIds([])
  }

  const handleBulkDelete = () => {
    if (selectedTemplateIds.length === 0) return

    const count = selectedTemplateIds.length
    const confirmation = confirm(
      `Delete ${count} template${count > 1 ? 's' : ''}? This action cannot be undone.`
    )

    if (confirmation) {
      deleteMultipleTemplates(selectedTemplateIds)
      setSelectedTemplateIds([])
      alert(`${count} template${count > 1 ? 's' : ''} deleted successfully!`)
    }
  }

  const handleBulkExport = () => {
    if (selectedTemplateIds.length === 0) return

    exportMultipleTemplates(selectedTemplateIds)
    alert(`${selectedTemplateIds.length} template${selectedTemplateIds.length > 1 ? 's' : ''} exported successfully!`)
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
          socialLinks: [],
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

      {/* User Templates: Search Bar + Import Button + Sort */}
      {activeTab === 'user' && (
        <>
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

          {/* Sort Dropdown + Selection Mode Toggle */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-templates" className="text-sm text-gray-600 font-medium">
              Sort by:
            </label>
            <select
              id="sort-templates"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="most-used">Most Used</option>
              <option value="least-used">Least Used</option>
            </select>
            <button
              onClick={() => setShowAnalytics(true)}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              title="View Analytics"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
            <button
              onClick={toggleSelectionMode}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                selectionMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {selectionMode ? 'Cancel' : 'Select'}
            </button>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectionMode && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTemplateIds.length} selected
                </span>
                <button
                  onClick={selectAllTemplates}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllTemplates}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkExport}
                  disabled={selectedTemplateIds.length === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedTemplateIds.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </>
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
          ) : sortedUserTemplates.length === 0 ? (
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
              {sortedUserTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selectionMode={selectionMode}
                  isSelected={selectedTemplateIds.includes(template.id)}
                  onToggleSelection={() => toggleTemplateSelection(template.id)}
                />
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

      {/* Analytics Modal */}
      {showAnalytics && activeTab === 'user' && (
        <TemplateAnalyticsModal
          templates={userTemplates}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  )
}
