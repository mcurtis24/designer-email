/**
 * AI Sidebar
 * Main sidebar for AI features with tabs
 */

import React, { useEffect } from 'react'
import { X, Sparkles, MessageSquare, Wand2, PenLine, DollarSign } from 'lucide-react'
import { useAI } from '@/lib/ai/AIContext'
import { getBudgetPercentage, getBudgetWarningLevel } from '@/lib/ai/utils/costCalculator'
import { GenerateTab } from './tabs/GenerateTab'
import { EnhanceTab } from './tabs/EnhanceTab'
import { ChatTab } from './tabs/ChatTab'

export function AISidebar() {
  const { isOpen, closeSidebar, activeTab, setActiveTab, currentCost, dailyBudget } = useAI()

  const budgetPercentage = getBudgetPercentage(currentCost, dailyBudget)
  const warningLevel = getBudgetWarningLevel(currentCost, dailyBudget)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeSidebar])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className="
          fixed top-0 right-0 bottom-0
          w-full sm:w-[400px]
          bg-white
          shadow-2xl
          z-50
          flex flex-col
          animate-in slide-in-from-right duration-300
        "
        role="dialog"
        aria-label="AI Assistant"
      >
        {/* Header */}
        <div
          className="
          flex items-center justify-between
          px-6 py-4
          border-b border-gray-200
          bg-gradient-to-r from-purple-50 to-white
        "
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          </div>

          <button
            onClick={closeSidebar}
            className="
              p-2 rounded-lg
              hover:bg-gray-100
              transition-colors
            "
            aria-label="Close AI Assistant"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cost Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Today's Budget</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span
                className={`font-medium ${
                  warningLevel === 'exceeded'
                    ? 'text-red-600'
                    : warningLevel === 'critical'
                      ? 'text-red-600'
                      : warningLevel === 'warning'
                        ? 'text-amber-600'
                        : 'text-green-600'
                }`}
              >
                ${currentCost.toFixed(2)} / ${dailyBudget.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Budget bar */}
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                warningLevel === 'exceeded'
                  ? 'bg-red-500'
                  : warningLevel === 'critical'
                    ? 'bg-red-500'
                    : warningLevel === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <TabButton
            icon={<Wand2 className="w-4 h-4" />}
            label="Generate"
            isActive={activeTab === 'generate'}
            onClick={() => setActiveTab('generate')}
          />
          <TabButton
            icon={<PenLine className="w-4 h-4" />}
            label="Enhance"
            isActive={activeTab === 'enhance'}
            onClick={() => setActiveTab('enhance')}
          />
          <TabButton
            icon={<MessageSquare className="w-4 h-4" />}
            label="Chat"
            isActive={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'generate' && <GenerateTab />}
          {activeTab === 'enhance' && <EnhanceTab />}
          {activeTab === 'chat' && <ChatTab />}
        </div>

        {/* Model Info Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            Powered by <span className="font-medium text-purple-600">Claude Sonnet 4.5</span>
          </div>
        </div>
      </div>
    </>
  )
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2
        px-4 py-3
        text-sm font-medium
        transition-colors
        ${
          isActive
            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
