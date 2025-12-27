import { useEmailStore } from '@/stores/emailStore'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import HeadingControls from '@/components/controls/HeadingControls'
import TextControls from '@/components/controls/TextControls'
import ImageControls from '@/components/controls/ImageControls'
import GalleryControls from '@/components/controls/GalleryControls'
import ButtonControls from '@/components/controls/ButtonControls'
import SpacerControls from '@/components/controls/SpacerControls'
import DividerControls from '@/components/controls/DividerControls'
import LayoutControls from '@/components/controls/LayoutControls'
import FooterControls from '@/components/controls/FooterControls'
import VideoControls from '@/components/controls/VideoControls'
import SocialIconsControls from '@/components/controls/SocialIconsControls'
import CommonControls from '@/components/controls/CommonControls'
import type { HeadingBlockData, TextBlockData, ImageBlockData, ImageGalleryBlockData, ButtonBlockData, SpacerBlockData, DividerBlockData, LayoutBlockData, FooterBlockData, VideoBlockData, SocialIconsBlockData } from '@/types/email'

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

    const blockTypeLabel = selectedBlock.type === 'imageGallery' ? 'Gallery' : selectedBlock.type

    return (
      <div className="h-full flex flex-col">
        {/* Block Type Header - STICKY */}
        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
            {getBlockIcon(selectedBlock.type)}
            {blockTypeLabel} Block
          </h3>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* BLOCK-SPECIFIC CONTROLS Section (Expanded) */}
          <CollapsibleSection
            title="Properties"
            blockType={selectedBlock.type}
            sectionName="properties"
            defaultOpen={true}
            helpText="Block-specific settings and styling options"
          >
            {selectedBlock.type === 'heading' && <HeadingControls block={selectedBlock as typeof selectedBlock & { data: HeadingBlockData }} />}
            {selectedBlock.type === 'text' && <TextControls block={selectedBlock as typeof selectedBlock & { data: TextBlockData }} />}
            {selectedBlock.type === 'image' && <ImageControls block={selectedBlock as typeof selectedBlock & { data: ImageBlockData }} />}
            {selectedBlock.type === 'imageGallery' && <GalleryControls block={selectedBlock as typeof selectedBlock & { data: ImageGalleryBlockData }} />}
            {selectedBlock.type === 'button' && <ButtonControls block={selectedBlock as typeof selectedBlock & { data: ButtonBlockData }} />}
            {selectedBlock.type === 'spacer' && <SpacerControls block={selectedBlock as typeof selectedBlock & { data: SpacerBlockData }} />}
            {selectedBlock.type === 'divider' && <DividerControls block={selectedBlock as typeof selectedBlock & { data: DividerBlockData }} />}
            {selectedBlock.type === 'layout' && <LayoutControls block={selectedBlock as typeof selectedBlock & { data: LayoutBlockData }} />}
            {selectedBlock.type === 'footer' && <FooterControls block={selectedBlock as typeof selectedBlock & { data: FooterBlockData }} />}
            {selectedBlock.type === 'video' && <VideoControls block={selectedBlock as typeof selectedBlock & { data: VideoBlockData }} />}
            {selectedBlock.type === 'socialIcons' && <SocialIconsControls block={selectedBlock as typeof selectedBlock & { data: SocialIconsBlockData }} />}
          </CollapsibleSection>

          {/* LAYOUT Section (Common controls) */}
          <CollapsibleSection
            title="Layout"
            blockType={selectedBlock.type}
            sectionName="layout"
            defaultOpen={true}
            helpText="Spacing, alignment, and positioning"
          >
            <CommonControls block={selectedBlock} />
          </CollapsibleSection>

          {/* BRAND STYLES Section (Only show if brand colors exist) */}
          {brandColors.length > 0 && (
            <CollapsibleSection
              title="Brand Styles"
              blockType={selectedBlock.type}
              sectionName="brand"
              defaultOpen={false}
              badge={`${brandColors.length}`}
              helpText="Quick-apply your brand colors"
            >
              <div className="space-y-2">
                <div className="text-xs text-gray-600 mb-3">Quick apply brand colors to this block</div>
                <div className="grid grid-cols-5 gap-2">
                  {brandColors.map((brandColor, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Apply brand color - will implement specific logic per block type
                        console.log('Apply brand color:', brandColor)
                      }}
                      className="group relative w-full aspect-square rounded-md border-2 border-gray-200 hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: brandColor.color }}
                      title={brandColor.name || brandColor.color}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Action Buttons - STICKY BOTTOM */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
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

  // Helper function to get block icon
  const getBlockIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      heading: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
      text: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
      image: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      imageGallery: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>,
      button: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>,
      spacer: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" /></svg>,
      divider: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>,
      layout: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" /></svg>,
      footer: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    }
    return icons[type] || null
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
