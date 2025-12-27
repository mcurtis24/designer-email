/**
 * AI Context Provider
 * Manages global AI state and provides hooks for AI features
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { EmailBlock } from '@/types/email'
import type { AIState, AIMessage, AITabType } from './types/ai'

// ============================================================================
// Context Definition
// ============================================================================

interface AIContextValue extends AIState {
  // Sidebar actions
  openSidebar: (tab?: AITabType) => void
  closeSidebar: () => void
  setActiveTab: (tab: AITabType) => void

  // Message actions
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void

  // Processing actions
  setProcessing: (isProcessing: boolean, type?: 'generate' | 'enhance' | 'chat') => void

  // Cost tracking
  addCost: (cost: number) => void
  resetDailyCost: () => void

  // Selection
  setSelectedText: (text: string | null) => void
  setSelectedBlockId: (blockId: string | null) => void

  // Editor integration
  applyBlocksToEditor: (blocks: EmailBlock[]) => void
  setApplyBlocksCallback: (callback: ((blocks: EmailBlock[]) => void) | null) => void
}

const AIContext = createContext<AIContextValue | undefined>(undefined)

// ============================================================================
// Provider Component
// ============================================================================

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AIState>({
    isOpen: false,
    activeTab: 'generate',
    isProcessing: false,
    processingType: null,
    messages: [],
    currentCost: 0,
    dailyBudget: parseFloat(import.meta.env.VITE_AI_DAILY_BUDGET || '5.0'),
    costResetDate: new Date().toISOString().split('T')[0],
    selectedText: null,
    selectedBlockId: null,
  })

  // Callback ref for applying blocks to the email editor
  const [applyBlocksCallback, setApplyBlocksCallbackState] = useState<
    ((blocks: EmailBlock[]) => void) | null
  >(null)

  // Reset cost at midnight
  useEffect(() => {
    const checkCostReset = () => {
      const today = new Date().toISOString().split('T')[0]
      if (state.costResetDate !== today) {
        setState((prev) => ({
          ...prev,
          currentCost: 0,
          costResetDate: today,
        }))
      }
    }

    // Check on mount and every minute
    checkCostReset()
    const interval = setInterval(checkCostReset, 60000)

    return () => clearInterval(interval)
  }, [state.costResetDate])

  // Keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setState((prev) => ({
          ...prev,
          isOpen: !prev.isOpen,
        }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openSidebar = useCallback((tab?: AITabType) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      activeTab: tab || prev.activeTab,
    }))
  }, [])

  const closeSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const setActiveTab = useCallback((tab: AITabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }))
  }, [])

  const addMessage = useCallback((message: Omit<AIMessage, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        },
      ],
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [] }))
  }, [])

  const setProcessing = useCallback(
    (isProcessing: boolean, type?: 'generate' | 'enhance' | 'chat') => {
      setState((prev) => ({
        ...prev,
        isProcessing,
        processingType: isProcessing ? type || null : null,
      }))
    },
    []
  )

  const addCost = useCallback((cost: number) => {
    setState((prev) => ({
      ...prev,
      currentCost: prev.currentCost + cost,
    }))
  }, [])

  const resetDailyCost = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentCost: 0,
      costResetDate: new Date().toISOString().split('T')[0],
    }))
  }, [])

  const setSelectedText = useCallback((text: string | null) => {
    setState((prev) => ({ ...prev, selectedText: text }))
  }, [])

  const setSelectedBlockId = useCallback((blockId: string | null) => {
    setState((prev) => ({ ...prev, selectedBlockId: blockId }))
  }, [])

  const setApplyBlocksCallback = useCallback(
    (callback: ((blocks: EmailBlock[]) => void) | null) => {
      setApplyBlocksCallbackState(() => callback)
    },
    []
  )

  const applyBlocksToEditor = useCallback(
    (blocks: EmailBlock[]) => {
      if (applyBlocksCallback) {
        applyBlocksCallback(blocks)
      } else {
        console.warn(
          'No apply blocks callback set. Make sure to connect the AI provider to the email editor.'
        )
      }
    },
    [applyBlocksCallback]
  )

  const value: AIContextValue = {
    ...state,
    openSidebar,
    closeSidebar,
    setActiveTab,
    addMessage,
    clearMessages,
    setProcessing,
    addCost,
    resetDailyCost,
    setSelectedText,
    setSelectedBlockId,
    applyBlocksToEditor,
    setApplyBlocksCallback,
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}
