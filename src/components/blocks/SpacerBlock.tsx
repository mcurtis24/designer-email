import { memo } from 'react'
import type { EmailBlock, SpacerBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface SpacerBlockProps {
  block: EmailBlock & { data: SpacerBlockData }
  isSelected: boolean
  onClick: () => void
}

function SpacerBlock({ block, isSelected, onClick }: SpacerBlockProps) {
  const { data } = block
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
    setActiveSidebarTab('style')
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      tabIndex={0}
      role="button"
      data-block-id={block.id}
      className={`cursor-pointer transition-all relative group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      style={{
        height: `${data.height}px`,
        backgroundColor: block.styles.backgroundColor || 'transparent',
      }}
    >
      {/* Visual indicator for spacer (only in editor, not in export) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-300">
          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V8m0 0L3 12m4-4l4 4m6 0v8m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-xs font-medium text-gray-600">
            {data.height}px
          </span>
        </div>
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(SpacerBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
