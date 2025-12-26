import { useEffect, useRef, useState } from 'react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  htmlContent: string
  title?: string
  footer?: React.ReactNode
}

export default function PreviewModal({ isOpen, onClose, htmlContent, title, footer }: PreviewModalProps) {
  const desktopIframeRef = useRef<HTMLIFrameElement>(null)
  const mobileIframeRef = useRef<HTMLIFrameElement>(null)
  const [activeView, setActiveView] = useState<'both' | 'desktop' | 'mobile'>('both')
  const [iframeKey, setIframeKey] = useState(0)

  // Force iframe recreation when modal opens to clear any stale content
  useEffect(() => {
    if (isOpen) {
      setIframeKey(prev => prev + 1)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && htmlContent) {
      // Small delay to ensure iframe is ready after recreation
      setTimeout(() => {
        // Write HTML to desktop iframe
        if (desktopIframeRef.current?.contentWindow) {
          const doc = desktopIframeRef.current.contentWindow.document
          doc.open()
          doc.write(htmlContent)
          doc.close()
        }

        // Write HTML to mobile iframe
        if (mobileIframeRef.current?.contentWindow) {
          const doc = mobileIframeRef.current.contentWindow.document
          doc.open()
          doc.write(htmlContent)
          doc.close()
        }
      }, 50)
    }
  }, [isOpen, htmlContent, iframeKey])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">{title || 'Email Preview'}</h2>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('both')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'both'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setActiveView('desktop')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setActiveView('mobile')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-gray-100 p-6">
          <div className="flex items-center justify-center gap-6 h-full">
            {/* Desktop Preview */}
            <div
              className={`flex flex-col items-center gap-2 flex-1 ${
                activeView === 'mobile' ? 'hidden' : ''
              }`}
            >
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Desktop (640px)
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '640px', maxWidth: '100%' }}>
                <iframe
                  key={`desktop-${iframeKey}`}
                  ref={desktopIframeRef}
                  title="Desktop Preview"
                  className="w-full border-0"
                  style={{ height: 'calc(95vh - 180px)' }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Mobile Preview */}
            <div
              className={`flex flex-col items-center gap-2 ${
                activeView === 'desktop' ? 'hidden' : ''
              }`}
            >
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Mobile (375px)
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '375px' }}>
                <iframe
                  key={`mobile-${iframeKey}`}
                  ref={mobileIframeRef}
                  title="Mobile Preview"
                  className="w-full border-0"
                  style={{ height: 'calc(95vh - 180px)' }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
