/**
 * AI Floating Action Button
 * Triggers the AI sidebar to open
 */

import { Sparkles } from 'lucide-react'
import { useAI } from '@/lib/ai/AIContext'
import { getBudgetWarningLevel } from '@/lib/ai/utils/costCalculator'

export function AIFloatingButton() {
  const { isOpen, openSidebar, isProcessing, currentCost, dailyBudget } = useAI()

  const warningLevel = getBudgetWarningLevel(currentCost, dailyBudget)
  const showBadge = warningLevel !== 'safe'

  return (
    <button
      onClick={() => openSidebar()}
      className={`
        fixed bottom-6 right-6 z-40
        w-16 h-16 rounded-full
        bg-gradient-to-br from-purple-500 to-purple-600
        hover:from-purple-600 hover:to-purple-700
        active:scale-95
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center justify-center
        group
        ${isOpen ? 'scale-90 opacity-50' : ''}
        ${isProcessing ? 'animate-pulse' : ''}
      `}
      aria-label="Open AI Assistant"
      title="AI Assistant (⌘K)"
    >
      {/* Sparkle Icon */}
      <Sparkles
        className={`
          w-7 h-7 text-white
          transition-transform duration-300
          ${isProcessing ? 'animate-spin' : 'group-hover:scale-110'}
        `}
      />

      {/* Badge for budget warning */}
      {showBadge && !isOpen && (
        <div
          className={`
            absolute -top-1 -right-1
            w-5 h-5 rounded-full
            ${
              warningLevel === 'exceeded'
                ? 'bg-red-500'
                : warningLevel === 'critical'
                  ? 'bg-red-500'
                  : 'bg-amber-500'
            }
            border-2 border-white
            flex items-center justify-center
            text-[10px] font-bold text-white
            animate-pulse
          `}
        >
          !
        </div>
      )}

      {/* Tooltip */}
      <div
        className="
          absolute bottom-full right-0 mb-2
          px-3 py-1.5
          bg-gray-900 text-white text-sm
          rounded-lg
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition-opacity duration-200
          whitespace-nowrap
        "
      >
        AI Assistant
        <span className="text-gray-400 ml-2">⌘K</span>
      </div>
    </button>
  )
}
