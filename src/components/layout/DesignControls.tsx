import { useEmailStore } from '@/stores/emailStore'
import { useMemo } from 'react'
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
import type { HeadingBlockData, TextBlockData, ImageBlockData, ImageGalleryBlockData, ButtonBlockData, SpacerBlockData, DividerBlockData, LayoutBlockData, FooterBlockData } from '@/types/email'

export default function DesignControls() {
  // Subscribe to selectedBlockId and blocks for reactive updates
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const blocks = useEmailStore((state) => state.email.blocks)
  const email = useEmailStore((state) => state.email)
  const setEmailSettings = useEmailStore((state) => state.setEmailSettings)

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

  // Render block-specific controls
  const renderBlockControls = () => {
    if (!selectedBlock) return null

    return (
      <div className="space-y-4">
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
      </div>
    )
  }

  return (
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
  )
}
