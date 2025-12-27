import { useEmailStore } from '@/stores/emailStore'

interface CollapsibleSectionProps {
  title: string
  blockType?: string
  sectionName: string
  defaultOpen?: boolean
  badge?: string | number
  helpText?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  blockType = 'global',
  sectionName,
  defaultOpen = false,
  badge,
  helpText,
  children
}: CollapsibleSectionProps) {
  // Use store-based state management for persistence across block switches
  const sectionStates = useEmailStore((state) => state.uiState?.collapsedSections || {})
  const setSectionState = useEmailStore((state) => state.setSectionState)

  // Get current state from store, fallback to defaultOpen if not set
  const sectionKey = `${blockType}:${sectionName}`
  const isOpen = sectionStates[sectionKey] !== undefined
    ? sectionStates[sectionKey]
    : defaultOpen

  const toggleSection = () => {
    setSectionState(blockType, sectionName, !isOpen)
  }

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={toggleSection}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors group"
        aria-expanded={isOpen}
        aria-controls={`section-${sectionKey}`}
        type="button"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
            {title}
          </span>
          {helpText && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Show tooltip or help modal
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title={helpText}
              aria-label={`Help for ${title}`}
              type="button"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {badge && (
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={`section-${sectionKey}`}
          className="px-4 pb-4 space-y-3 animate-fadeIn"
          role="region"
          aria-label={`${title} controls`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
