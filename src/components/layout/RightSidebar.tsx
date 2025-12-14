import BlockLibrary from './BlockLibrary'
import DesignControls from './DesignControls'
import TemplateLibrary from './TemplateLibrary'
import { AssetLibrary } from './AssetLibrary'
import { useEmailStore } from '@/stores/emailStore'

// Right sidebar with tabs for Blocks, Style, Templates, and Branding
export default function RightSidebar() {
  const activeTab = useEmailStore((state) => state.activeSidebarTab)
  const setActiveTab = useEmailStore((state) => state.setActiveSidebarTab)

  return (
    <div className="right-sidebar bg-white border-l border-gray-200 flex flex-col h-full" style={{ width: '470px' }}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'blocks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Blocks
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'style'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'branding'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Branding
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {activeTab === 'blocks' && (
          <div className="p-4">
            <BlockLibrary />
          </div>
        )}

        {activeTab === 'style' && (
          <div className="p-4">
            <DesignControls />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-4">
            <TemplateLibrary />
          </div>
        )}

        {activeTab === 'assets' && (
          <AssetLibrary />
        )}

        {activeTab === 'branding' && (
          <div className="p-4">
            <div className="text-center text-gray-500 py-12">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <p className="text-sm">Brand settings</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
