import { useEmailStore } from '@/stores/emailStore'
import { useMemo, useState } from 'react'
import HeadingControls from '@/components/controls/HeadingControls'
import TextControls from '@/components/controls/TextControls'
import ImageControls from '@/components/controls/ImageControls'
import GalleryControls from '@/components/controls/GalleryControls'
import ButtonControls from '@/components/controls/ButtonControls'
import SpacerControls from '@/components/controls/SpacerControls'
import DividerControls from '@/components/controls/DividerControls'
import LayoutControls from '@/components/controls/LayoutControls'
import FooterControls from '@/components/controls/FooterControls'
import CommonControls from '@/components/controls/CommonControls'
import QuickApplyToolbar from '@/components/ui/QuickApplyToolbar'
import type { HeadingBlockData, TextBlockData, ImageBlockData, ImageGalleryBlockData, ButtonBlockData, SpacerBlockData, DividerBlockData, LayoutBlockData, FooterBlockData } from '@/types/email'

export default function DesignControls() {
  // Subscribe to selectedBlockId and blocks for reactive updates
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const blocks = useEmailStore((state) => state.email.blocks)
  const email = useEmailStore((state) => state.email)
  const setEmailSettings = useEmailStore((state) => state.setEmailSettings)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const saveComponent = useEmailStore((state) => state.saveComponent)

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [componentName, setComponentName] = useState('')
  const [componentCategory, setComponentCategory] = useState('')

  // Find the selected block reactively (including nested blocks in layouts)
  const selectedBlock = useMemo(() => {
    if (!selectedBlockId) return null

    // First check top-level blocks
    const topLevelBlock = blocks.find((b) => b.id === selectedBlockId)
    if (topLevelBlock) return topLevelBlock

    // If not found, search inside layout blocks' children
    for (const block of blocks) {
      if (block.type === 'layout') {
        const layoutData = block.data as LayoutBlockData
        const childBlock = layoutData.children.find((child) => child.id === selectedBlockId)
        if (childBlock) return childBlock
      }
    }

    return null
  }, [selectedBlockId, blocks])

  const handleEmailSettingsChange = (setting: string, value: any) => {
    setEmailSettings({ [setting]: value })
  }

  const handleSaveComponent = () => {
    if (!selectedBlock || !componentName.trim()) return

    saveComponent(selectedBlock.id, componentName.trim(), componentCategory || undefined)
    setShowSaveDialog(false)
    setComponentName('')
    setComponentCategory('')
  }

  // Render block-specific controls
  const renderBlockControls = () => {
    if (!selectedBlock) return null

    return (
      <div className="space-y-4">
        {/* Quick Apply Toolbar - ALWAYS VISIBLE when block selected */}
        {brandColors.length > 0 && (
          <QuickApplyToolbar brandColors={brandColors} />
        )}

        {/* Block Type Header */}
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 capitalize">
            {selectedBlock.type} Block
          </h3>
        </div>

        {/* Block-Specific Controls */}
        {selectedBlock.type === 'heading' && <HeadingControls block={selectedBlock as typeof selectedBlock & { data: HeadingBlockData }} />}
        {selectedBlock.type === 'text' && <TextControls block={selectedBlock as typeof selectedBlock & { data: TextBlockData }} />}
        {selectedBlock.type === 'image' && <ImageControls block={selectedBlock as typeof selectedBlock & { data: ImageBlockData }} />}
        {selectedBlock.type === 'imageGallery' && <GalleryControls block={selectedBlock as typeof selectedBlock & { data: ImageGalleryBlockData }} />}
        {selectedBlock.type === 'button' && <ButtonControls block={selectedBlock as typeof selectedBlock & { data: ButtonBlockData }} />}
        {selectedBlock.type === 'spacer' && <SpacerControls block={selectedBlock as typeof selectedBlock & { data: SpacerBlockData }} />}
        {selectedBlock.type === 'divider' && <DividerControls block={selectedBlock as typeof selectedBlock & { data: DividerBlockData }} />}
        {selectedBlock.type === 'layout' && <LayoutControls block={selectedBlock as typeof selectedBlock & { data: LayoutBlockData }} />}
        {selectedBlock.type === 'footer' && <FooterControls block={selectedBlock as typeof selectedBlock & { data: FooterBlockData }} />}

        {/* Common Controls (Padding, Background, Alignment) */}
        <CommonControls block={selectedBlock} />

        {/* Save as Component Button */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Save as Component
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Save Component Dialog */}
      {showSaveDialog && selectedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Save as Component</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Name *
                </label>
                <input
                  type="text"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g., Newsletter Header"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveComponent()
                    if (e.key === 'Escape') setShowSaveDialog(false)
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={componentCategory}
                  onChange={(e) => setComponentCategory(e.target.value)}
                  placeholder="e.g., Headers, CTAs, Footers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveComponent()
                    if (e.key === 'Escape') setShowSaveDialog(false)
                  }}
                />
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Saving: {selectedBlock.type} block</p>
                <p>This will save the block with all its content and styling for reuse.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setComponentName('')
                  setComponentCategory('')
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComponent}
                disabled={!componentName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Design Controls Content */}
      <div className="p-3 overflow-y-auto h-full">
        {selectedBlock ? (
          renderBlockControls()
        ) : (
          <>
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No block selected</p>
              <p className="text-xs mt-1">Select a block to edit its properties</p>
            </div>

            {/* Email-level settings */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Email Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={email.settings.backgroundColor}
                    onChange={(e) => handleEmailSettingsChange('backgroundColor', e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Width (px)
                  </label>
                  <input
                    type="number"
                    value={email.settings.contentWidth}
                    onChange={(e) => handleEmailSettingsChange('contentWidth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    min="320"
                    max="800"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
