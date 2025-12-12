import { memo } from 'react'
import type { EmailBlock, DividerBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface DividerBlockProps {
  block: EmailBlock & { data: DividerBlockData }
  isSelected: boolean
  onClick: () => void
}

function DividerBlock({ block, isSelected, onClick }: DividerBlockProps) {
  const data = block.data as DividerBlockData
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
      className={`w-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{
        padding: data.padding || '16px 0',
        minHeight: '24px',
      }}
    >
      <hr
        style={{
          width: data.width || '100%',
          height: '0',
          border: 'none',
          borderTop: `${data.thickness || 1}px ${data.style || 'solid'} ${
            data.color || '#e5e7eb'
          }`,
          margin: '0',
          padding: '0',
        }}
      />
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(DividerBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
