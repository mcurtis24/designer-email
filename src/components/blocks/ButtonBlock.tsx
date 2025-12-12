import { memo } from 'react'
import type { EmailBlock, ButtonBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface ButtonBlockProps {
  block: EmailBlock & { data: ButtonBlockData }
  isSelected?: boolean
  onClick?: () => void
}

function ButtonBlock({ block, isSelected, onClick }: ButtonBlockProps) {
  const { data, styles } = block
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Select the block
    onClick?.()

    // Switch to Style tab
    setActiveSidebarTab('style')
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      style={{
        paddingTop: styles.padding?.top,
        paddingRight: styles.padding?.right,
        paddingBottom: styles.padding?.bottom,
        paddingLeft: styles.padding?.left,
        backgroundColor: styles.backgroundColor,
        textAlign: data.alignment,
      }}
    >
      <a
        href={data.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'inline-block',
          backgroundColor: data.backgroundColor,
          color: data.textColor,
          paddingTop: data.padding.top,
          paddingRight: data.padding.right,
          paddingBottom: data.padding.bottom,
          paddingLeft: data.padding.left,
          borderRadius: `${data.borderRadius}px`,
          textDecoration: 'none',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '16px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          width: data.width ? `${data.width}px` : 'auto',
          textAlign: 'center',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {data.text}
      </a>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(ButtonBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
