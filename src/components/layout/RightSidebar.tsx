import { useState } from 'react'
import BlockLibrary from './BlockLibrary'
import DesignControls from './DesignControls'
import TemplateLibrary from './TemplateLibrary'
import { AssetLibrary } from './AssetLibrary'
import BrandingTab from './BrandingTab'
import SavedComponentsLibrary from './SavedComponentsLibrary'
import { useEmailStore } from '@/stores/emailStore'

// Right sidebar with consolidated 3-tab navigation
export default function RightSidebar() {
  const activeTab = useEmailStore((state) => state.activeSidebarTab)
  const setActiveTab = useEmailStore((state) => state.setActiveSidebarTab)
  const blocks = useEmailStore((state) => state.email.blocks)
  const [showBrandingModal, setShowBrandingModal] = useState(false)

  // Map old tab types to new consolidated tabs
  const currentTab =
    activeTab === 'blocks' || activeTab === 'assets' ? 'content' :
    activeTab === 'branding' ? 'style' : // Auto-redirect branding to style
    activeTab

  return (
    <div className="right-sidebar bg-white border-l border-gray-200 flex flex-col h-full" style={{ width: '470px' }}>
      {/* Tab Navigation - 3 Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentTab === 'content'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentTab === 'style'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Content Tab - Combines Blocks + Assets */}
        {currentTab === 'content' && (
          <div className="flex flex-col h-full">
            {/* Block Library - Always visible */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Blocks
              </h3>
              <BlockLibrary />
            </div>

            {/* Saved Components Library - Collapsible */}
            <details className="border-b border-gray-100" open>
              <summary className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <span>Saved Components</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-gray-100">
                <SavedComponentsLibrary />
              </div>
            </details>

            {/* Asset Library - Collapsible */}
            <details className="border-b border-gray-100" open>
              <summary className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <span>Image Assets</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-gray-100">
                <AssetLibrary />
              </div>
            </details>

            {/* Browse Templates CTA - Show when canvas is empty */}
            {blocks.length === 0 && (
              <div className="mt-auto p-4 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <p className="text-sm text-gray-600 mb-3">
                  Start with a professional template
                </p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Browse Templates
                </button>
              </div>
            )}
          </div>
        )}

        {/* Style Tab */}
        {currentTab === 'style' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4">
              <DesignControls />
            </div>

            {/* Brand Kit Management Link */}
            <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowBrandingModal(true)}
                className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Manage Brand Kit
              </button>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {currentTab === 'templates' && (
          <div className="p-4">
            <TemplateLibrary />
          </div>
        )}
      </div>

      {/* Branding Modal - Full-screen overlay */}
      {showBrandingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Brand Kit Management</h2>
              <button
                onClick={() => setShowBrandingModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <BrandingTab />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
