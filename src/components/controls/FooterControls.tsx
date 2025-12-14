import { useState } from 'react'
import type { EmailBlock, FooterBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

interface FooterControlsProps {
  block: EmailBlock & { data: FooterBlockData }
}

const SOCIAL_PLATFORMS: Array<FooterBlockData['socialLinks'][0]['platform']> = [
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
  'tiktok',
]

export default function FooterControls({ block }: FooterControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const [newLinkText, setNewLinkText] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')

  const handleCompanyNameChange = (companyName: string) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        companyName,
      },
    })
  }

  const handleAddressChange = (address: string) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        address,
      },
    })
  }

  const handleLegalTextChange = (legalText: string) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        legalText,
      },
    })
  }

  const handleToggleSocial = (platform: typeof SOCIAL_PLATFORMS[0], checked: boolean) => {
    const newSocialLinks = checked
      ? [...block.data.socialLinks, { platform, url: '' }]
      : block.data.socialLinks.filter((s) => s.platform !== platform)

    updateBlock(block.id, {
      data: {
        ...block.data,
        socialLinks: newSocialLinks,
      },
    })
  }

  const handleSocialUrlChange = (platform: typeof SOCIAL_PLATFORMS[0], url: string) => {
    const newSocialLinks = block.data.socialLinks.map((s) =>
      s.platform === platform ? { ...s, url } : s
    )

    updateBlock(block.id, {
      data: {
        ...block.data,
        socialLinks: newSocialLinks,
      },
    })
  }

  const handleAddLink = () => {
    if (newLinkText && newLinkUrl) {
      updateBlock(block.id, {
        data: {
          ...block.data,
          links: [...block.data.links, { text: newLinkText, url: newLinkUrl }],
        },
      })
      setNewLinkText('')
      setNewLinkUrl('')
    }
  }

  const handleRemoveLink = (index: number) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        links: block.data.links.filter((_, i) => i !== index),
      },
    })
  }

  const handleBackgroundColorChange = (backgroundColor: string) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        backgroundColor,
      },
    })
  }

  const handleTextColorChange = (textColor: string) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        textColor,
      },
    })
  }

  const handleLinkColorChange = (linkColor: string) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        linkColor,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Info
        </label>
        <div className="space-y-2">
          <input
            type="text"
            value={block.data.companyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            placeholder="Company Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <textarea
            value={block.data.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="123 Main St, City, State 12345"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social Media Links
        </label>
        <div className="space-y-2">
          {SOCIAL_PLATFORMS.map((platform) => {
            const existing = block.data.socialLinks.find((s) => s.platform === platform)
            return (
              <div key={platform}>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={!!existing}
                    onChange={(e) => handleToggleSocial(platform, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm capitalize">{platform}</span>
                </label>
                {existing && (
                  <input
                    type="url"
                    value={existing.url}
                    onChange={(e) => handleSocialUrlChange(platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourprofile`}
                    className="w-full px-3 py-1.5 ml-6 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Links
        </label>
        <div className="space-y-2">
          {block.data.links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={link.text}
                  readOnly
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                />
                <input
                  type="url"
                  value={link.url}
                  readOnly
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                />
              </div>
              <button
                onClick={() => handleRemoveLink(index)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <input
              type="text"
              value={newLinkText}
              onChange={(e) => setNewLinkText(e.target.value)}
              placeholder="Link text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleAddLink}
              disabled={!newLinkText || !newLinkUrl}
              className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Link
            </button>
          </div>
        </div>
      </div>

      {/* Legal Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Legal Text
        </label>
        <textarea
          value={block.data.legalText}
          onChange={(e) => handleLegalTextChange(e.target.value)}
          placeholder="© 2025 Your Company. All rights reserved."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Styling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Styling
        </label>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={block.data.backgroundColor || '#F3F4F6'}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={block.data.textColor || '#6B7280'}
              onChange={(e) => handleTextColorChange(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Link Color</label>
            <input
              type="color"
              value={block.data.linkColor || '#3B82F6'}
              onChange={(e) => handleLinkColorChange(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
