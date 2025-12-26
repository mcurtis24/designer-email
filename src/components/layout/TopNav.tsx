import { useEmailStore } from '@/stores/emailStore'
import { generateEmailHTML } from '@/lib/htmlGenerator'
import { useState, useMemo } from 'react'
import { sendTestEmail, validateEmail } from '@/lib/resend'
import { isResendConfigured } from '@/lib/config'
import PreviewModal from '@/components/ui/PreviewModal'
import VersionHistoryModal from '@/components/ui/VersionHistoryModal'
import SaveDialog from '@/components/ui/SaveDialog'

export default function TopNav() {
  const email = useEmailStore((state) => state.email)
  const undo = useEmailStore((state) => state.undo)
  const redo = useEmailStore((state) => state.redo)
  const canUndo = useEmailStore((state) => state.canUndo())
  const canRedo = useEmailStore((state) => state.canRedo())

  const [showTestModal, setShowTestModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testSubject, setTestSubject] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  // Memoize HTML generation for preview (without Outlook fallback to prevent duplication)
  const previewHTML = useMemo(() => generateEmailHTML(email, false), [email])

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
        <button className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 ml-2">
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
      </div>

      {/* Center Section - Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-xl font-semibold text-white">Designer Email</h1>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
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
    </nav>
  )
}
