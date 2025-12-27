import { useEmailStore } from '@/stores/emailStore'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import { useState, useMemo } from 'react'
import { sendTestEmail, validateEmail } from '@/lib/resend'
import { isResendConfigured } from '@/lib/config'
import PreviewModal from '@/components/ui/PreviewModal'
import VersionHistoryModal from '@/components/ui/VersionHistoryModal'
import SaveDialog from '@/components/ui/SaveDialog'
import SaveTemplateDialog from '@/components/ui/SaveTemplateDialog'
import AccessibilityPanel from '@/components/ui/AccessibilityPanel'
import { validateAccessibility, getIssueCounts } from '@/lib/validation/accessibility'

export default function TopNav() {
  const email = useEmailStore((state) => state.email)
  const undo = useEmailStore((state) => state.undo)
  const redo = useEmailStore((state) => state.redo)
  const canUndo = useEmailStore((state) => state.canUndo())
  const canRedo = useEmailStore((state) => state.canRedo())
  const loadedTemplateId = useEmailStore((state) => state.loadedTemplateId)
  const userTemplates = useEmailStore((state) => state.userTemplates)
  const updateTemplateContent = useEmailStore((state) => state.updateTemplateContent)
  const viewportMode = useEmailStore((state) => state.editorState.viewport.mode)
  const setViewportMode = useEmailStore((state) => state.setViewportMode)
  const zoom = useEmailStore((state) => state.editorState.viewport.zoom)
  const setZoom = useEmailStore((state) => state.setZoom)

  const [showTestModal, setShowTestModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testSubject, setTestSubject] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  // Get loaded template name
  const loadedTemplate = loadedTemplateId ? userTemplates.find(t => t.id === loadedTemplateId) : null

  // Memoize HTML generation for preview (without Outlook fallback to prevent duplication)
  const previewHTML = useMemo(() => generateEmailHTML(email, false), [email])

  // Memoize accessibility validation
  const accessibilityIssues = useMemo(() => validateAccessibility(email), [email])
  const issueCounts = useMemo(() => getIssueCounts(accessibilityIssues), [accessibilityIssues])

  const handlePreview = () => {
    setShowPreviewModal(true)
  }

  const handleTestEmail = () => {
    if (!isResendConfigured()) {
      alert('Resend is not configured. Please set VITE_RESEND_API_KEY and VITE_RESEND_FROM_EMAIL in your .env file.')
      return
    }
    setShowTestModal(true)
    setTestSubject(email.title || 'Test Email')
    setSendError(null)
    setSendSuccess(false)
  }

  const handleSendTest = async () => {
    if (!validateEmail(testEmail)) {
      setSendError('Please enter a valid email address')
      return
    }

    if (!testSubject.trim()) {
      setSendError('Please enter a subject line')
      return
    }

    setIsSending(true)
    setSendError(null)
    setSendSuccess(false)

    try {
      await sendTestEmail({
        to: testEmail,
        subject: testSubject,
        email,
      })
      setSendSuccess(true)
      setTimeout(() => {
        setShowTestModal(false)
        setTestEmail('')
        setSendSuccess(false)
      }, 2000)
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Failed to send test email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <nav className="h-[60px] bg-[#1e3a5f] flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* App Title */}
        <h1 className="text-2xl font-bold text-white">Designer Email</h1>

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title={canUndo ? 'Undo (Cmd+Z)' : 'Nothing to undo'}
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title={canRedo ? 'Redo (Cmd+Shift+Z)' : 'Nothing to redo'}
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20"></div>

        {/* History & Save Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowVersionHistory(true)}
            title="Version History"
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            title="Save Version"
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20"></div>

        {/* Viewport Mode Toggle */}
        <div className="flex items-center bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-all ${
              viewportMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white hover:text-gray-200'
            }`}
            title="Desktop view (640px)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Desktop
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-all ${
              viewportMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white hover:text-gray-200'
            }`}
            title="Mobile view (375px)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile
          </button>
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-0.5 text-white hover:text-gray-200 transition-colors"
            title="Zoom out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-white text-xs font-medium min-w-[40px] text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-0.5 text-white hover:text-gray-200 transition-colors"
            title="Zoom in"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(100)}
            className="ml-0.5 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-white/20 rounded transition-colors"
            title="Reset zoom to 100%"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Accessibility Warnings */}
        {issueCounts.total > 0 && (
          <button
            onClick={() => setShowAccessibilityPanel(true)}
            className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors border-2 border-yellow-400"
            title={`${issueCounts.errors} errors, ${issueCounts.warnings} warnings`}
          >
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-yellow-700">{issueCounts.total}</span>
            {issueCounts.errors > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {issueCounts.errors}
              </span>
            )}
          </button>
        )}

        {/* Update Template Button - Only shows when a user template is loaded */}
        {loadedTemplateId && loadedTemplate && (
          <button
            onClick={async () => {
              if (confirm(`Update template "${loadedTemplate.name}" with current changes?`)) {
                setIsUpdatingTemplate(true)
                try {
                  await updateTemplateContent()
                  alert('Template updated successfully!')
                } catch (error) {
                  alert('Failed to update template. Please try again.')
                } finally {
                  setIsUpdatingTemplate(false)
                }
              }
            }}
            disabled={isUpdatingTemplate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Update "${loadedTemplate.name}" with current changes`}
          >
            {isUpdatingTemplate ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Update "{loadedTemplate.name.length > 15 ? loadedTemplate.name.substring(0, 15) + '...' : loadedTemplate.name}"</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setShowSaveTemplateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
          title="Save current email as a new template"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save as Template
        </button>

        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        <button
          onClick={handleTestEmail}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Test Email
        </button>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>

            {sendSuccess ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✓</div>
                <p className="text-green-600 font-medium">Test email sent successfully!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendTest()
                        if (e.key === 'Escape') setShowTestModal(false)
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={testSubject}
                      onChange={(e) => setTestSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendTest()
                        if (e.key === 'Escape') setShowTestModal(false)
                      }}
                    />
                  </div>
                </div>

                {sendError && (
                  <p className="text-sm text-red-600 mb-4">{sendError}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowTestModal(false)}
                    disabled={isSending}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendTest}
                    disabled={isSending}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        htmlContent={previewHTML}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
      />

      {/* Save Dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />

      {/* Accessibility Panel */}
      {showAccessibilityPanel && (
        <AccessibilityPanel
          issues={accessibilityIssues}
          onClose={() => setShowAccessibilityPanel(false)}
        />
      )}

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        isOpen={showSaveTemplateDialog}
        onClose={() => setShowSaveTemplateDialog(false)}
        onSuccess={() => {
          setShowSaveTemplateDialog(false)
          alert('Template saved successfully! You can find it in the "My Templates" tab.')
        }}
      />
    </nav>
  )
}
