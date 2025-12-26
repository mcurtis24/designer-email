import { AccessibilityIssue } from '@/lib/validation/accessibility'
import { useEmailStore } from '@/stores/emailStore'

interface AccessibilityPanelProps {
  issues: AccessibilityIssue[]
  onClose: () => void
}

export default function AccessibilityPanel({ issues, onClose }: AccessibilityPanelProps) {
  const selectBlock = useEmailStore((state) => state.selectBlock)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  const handleFixIssue = (issue: AccessibilityIssue) => {
    // Select the block with the issue
    selectBlock(issue.blockId)
    // Switch to Style tab so user can edit
    setActiveSidebarTab('style')
    // Close the panel
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Accessibility Issues</h3>
            <p className="text-sm text-gray-600 mt-1">
              {errors.length} {errors.length === 1 ? 'error' : 'errors'}, {warnings.length}{' '}
              {warnings.length === 1 ? 'warning' : 'warnings'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {issues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-lg font-medium text-green-600 mb-2">No accessibility issues found!</p>
              <p className="text-sm text-gray-600">Your email follows accessibility best practices.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Errors Section */}
              {errors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Errors ({errors.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {errors.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} onFix={() => handleFixIssue(issue)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings Section */}
              {warnings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Warnings ({warnings.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {warnings.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} onFix={() => handleFixIssue(issue)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Why accessibility matters:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Screen readers need alt text to describe images to visually impaired users</li>
                <li>Alt text displays when images fail to load or are blocked</li>
                <li>Better accessibility improves deliverability and engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IssueCard({ issue, onFix }: { issue: AccessibilityIssue; onFix: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {issue.severity === 'error' ? (
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {issue.blockType}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 mb-1">{issue.message}</p>
          <p className="text-sm text-gray-600">{issue.suggestion}</p>
        </div>

        <button
          onClick={onFix}
          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          Fix →
        </button>
      </div>
    </div>
  )
}
