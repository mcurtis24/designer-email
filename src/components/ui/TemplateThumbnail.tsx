/**
 * Template Thumbnail Component
 * Displays a scaled-down preview of an email template
 */

import { useEffect, useRef, useState } from 'react'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import type { Template } from '@/lib/templates'
import type { EmailDocument } from '@/types/email'

interface TemplateThumbnailProps {
  template: Template
  className?: string
}

export default function TemplateThumbnail({ template, className = '' }: TemplateThumbnailProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!iframeRef.current) return

    try {
      // Create temporary email document with stock content
      const blocksWithOrder = template.blocks.map((block, index) => ({
        ...block,
        order: index
      }))

      const tempEmail: EmailDocument = {
        id: 'thumbnail-preview',
        title: template.name,
        blocks: blocksWithOrder,
        settings: {
          backgroundColor: template.settings.backgroundColor || '#FFFFFF',
          contentWidth: 600,
          fontFamily: template.settings.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textColor: template.settings.textColor || '#1F2937',
          brandColors: template.settings.brandColors || []
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        metadata: {},
        history: []
      }

      // Generate HTML (no Outlook fallback for preview)
      const html = generateEmailHTML(tempEmail, false)

      // Write to iframe
      const iframeDoc = iframeRef.current.contentDocument
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(html)
        iframeDoc.close()
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Thumbnail generation failed:', error)
      setIsLoading(false)
    }
  }, [template])

  return (
    <div className={`relative overflow-hidden bg-gray-50 rounded ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={`Preview of ${template.name}`}
        className="w-full h-full border-0 pointer-events-none"
        style={{
          transform: 'scale(0.25)',
          transformOrigin: 'top left',
          width: '400%',
          height: '400%'
        }}
        sandbox="allow-same-origin"
      />
    </div>
  )
}
