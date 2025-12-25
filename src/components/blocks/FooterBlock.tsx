import { memo } from 'react'
import type { EmailBlock, FooterBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface FooterBlockProps {
  block: EmailBlock & { data: FooterBlockData }
  isSelected?: boolean
  onClick?: () => void
}

// Social media icon URLs (using hosted images for email compatibility)
const SOCIAL_ICON_URLS: Record<string, string> = {
  facebook: 'https://img.icons8.com/ios-filled/50/6B7280/facebook-new.png',
  x: 'https://img.icons8.com/ios-filled/50/6B7280/twitterx--v1.png',
  twitter: 'https://img.icons8.com/ios-filled/50/6B7280/twitterx--v1.png', // Legacy support
  instagram: 'https://img.icons8.com/ios-filled/50/6B7280/instagram-new.png',
  linkedin: 'https://img.icons8.com/ios-filled/50/6B7280/linkedin.png',
  youtube: 'https://img.icons8.com/ios-filled/50/6B7280/youtube-play.png',
  tiktok: 'https://img.icons8.com/ios-filled/50/6B7280/tiktok.png',
}

function FooterBlock({ block, isSelected, onClick }: FooterBlockProps) {
  const { data, styles } = block
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
    setActiveSidebarTab('style')
  }

  const textColor = data.textColor || '#6B7280'
  const linkColor = data.linkColor || '#3B82F6'
  const bgColor = data.backgroundColor || '#F3F4F6'
  const fontSize = data.fontSize || '14px'

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        paddingTop: styles.padding?.top || '40px',
        paddingRight: styles.padding?.right || '20px',
        paddingBottom: styles.padding?.bottom || '40px',
        paddingLeft: styles.padding?.left || '20px',
      }}
    >
      {/* Company Info */}
      {(data.companyName || data.address) && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {data.companyName && (
            <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
              {data.companyName}
            </div>
          )}
          {data.address && (
            <div style={{ fontSize, lineHeight: 1.5 }}>
              {data.address}
            </div>
          )}
        </div>
      )}

      {/* Social Icons */}
      {data.socialLinks.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {data.socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                width: '32px',
                height: '32px',
                color: textColor,
                transition: 'opacity 0.2s',
              }}
              className="hover:opacity-70"
            >
              <img
                src={social.platform === 'custom' && social.iconUrl
                  ? social.iconUrl
                  : SOCIAL_ICON_URLS[social.platform] || SOCIAL_ICON_URLS['facebook']}
                alt={social.platform === 'x' || social.platform === 'twitter' ? 'X' : social.platform}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'block',
                }}
              />
            </a>
          ))}
        </div>
      )}

      {/* Footer Links */}
      {data.links.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          fontSize
        }}>
          {data.links.map((link, index) => (
            <span key={index}>
              <a
                href={link.url || '#'}
                style={{
                  color: linkColor,
                  textDecoration: 'none',
                }}
                className="hover:underline"
              >
                {link.text}
              </a>
              {index < data.links.length - 1 && <span style={{ margin: '0 8px', color: textColor }}>|</span>}
            </span>
          ))}
        </div>
      )}

      {/* Legal Text */}
      {data.legalText && (
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: textColor,
          opacity: 0.8,
          lineHeight: 1.5
        }}>
          {data.legalText}
        </div>
      )}

      {/* Empty state */}
      {!data.companyName && !data.address && data.socialLinks.length === 0 && data.links.length === 0 && !data.legalText && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#9CA3AF',
          fontSize: '14px'
        }}>
          Click to configure your footer
        </div>
      )}
    </div>
  )
}

// Memoize component
export default memo(FooterBlock, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
