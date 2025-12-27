/**
 * AI Type Definitions
 * Types for the AI-powered features
 */

import type { EmailBlock } from '@/types/email'

// ============================================================================
// AI Message Types
// ============================================================================

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  cost?: number
  tokens?: {
    input: number
    output: number
  }
  metadata?: {
    model?: string
    error?: boolean
    commandsExecuted?: AICommand[]
  }
}

// ============================================================================
// AI Command Types
// ============================================================================

export type AICommandType =
  | 'add_block'
  | 'update_block'
  | 'delete_block'
  | 'reorder_blocks'
  | 'apply_styles'
  | 'update_settings'

export interface AICommand {
  type: AICommandType
  data: any
  blockId?: string
  description?: string
}

export interface AddBlockCommand extends AICommand {
  type: 'add_block'
  data: {
    block: EmailBlock
    position: 'top' | 'bottom' | number
  }
}

export interface UpdateBlockCommand extends AICommand {
  type: 'update_block'
  data: {
    blockId: string
    updates: Partial<EmailBlock>
  }
}

export interface DeleteBlockCommand extends AICommand {
  type: 'delete_block'
  data: {
    blockId: string
  }
}

export interface ReorderBlocksCommand extends AICommand {
  type: 'reorder_blocks'
  data: {
    blockIds: string[]
  }
}

export interface ApplyStylesCommand extends AICommand {
  type: 'apply_styles'
  data: {
    blockTypes?: string[]
    blockIds?: string[]
    styles: Record<string, any>
  }
}

// ============================================================================
// AI Generation Types
// ============================================================================

export type TemplateType =
  | 'newsletter'
  | 'event'
  | 'announcement'
  | 'reminder'
  | 'emergency'
  | 'promotion'
  | 'welcome'
  | 'custom'

export type AudienceType = 'parents' | 'staff' | 'students' | 'community' | 'general'

export type ToneType = 'friendly' | 'professional' | 'urgent' | 'casual' | 'formal'

export interface GenerationContext {
  schoolName?: string
  audience?: AudienceType
  tone?: ToneType
  templateType?: TemplateType
  brandColors?: string[]
  existingBlocks?: EmailBlock[]
}

export interface GenerationResult {
  blocks: EmailBlock[]
  metadata?: {
    suggestedSubject?: string
    previewText?: string
    estimatedReadTime?: string
  }
  cost: number
  tokens: {
    input: number
    output: number
  }
}

// ============================================================================
// AI Enhancement Types
// ============================================================================

export type EnhancementType =
  | 'grammar'
  | 'tone_professional'
  | 'tone_friendly'
  | 'tone_urgent'
  | 'simplify'
  | 'expand'
  | 'shorten'
  | 'inclusive'

export interface EnhancementResult {
  original: string
  enhanced: string
  changes: {
    type: 'addition' | 'deletion' | 'modification'
    original: string
    modified: string
    reason?: string
  }[]
  cost: number
  tokens: {
    input: number
    output: number
  }
}

// ============================================================================
// AI State Types
// ============================================================================

export type AITabType = 'generate' | 'enhance' | 'chat'

export interface AIState {
  // Sidebar state
  isOpen: boolean
  activeTab: AITabType

  // Processing state
  isProcessing: boolean
  processingType: 'generate' | 'enhance' | 'chat' | null

  // Chat state
  messages: AIMessage[]

  // Cost tracking
  currentCost: number
  dailyBudget: number
  costResetDate: string // ISO date string

  // Selection state
  selectedText: string | null
  selectedBlockId: string | null
}

// ============================================================================
// AI Service Types
// ============================================================================

export interface ClaudeServiceConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature?: number
}

export interface AIServiceError {
  type: 'api_error' | 'rate_limit' | 'invalid_response' | 'network_error' | 'budget_exceeded'
  message: string
  details?: any
  retryable?: boolean
}

// ============================================================================
// Token and Cost Types
// ============================================================================

export interface TokenUsage {
  input: number
  output: number
  total: number
}

export interface CostEstimate {
  inputCost: number
  outputCost: number
  totalCost: number
  tokens: TokenUsage
}

// ============================================================================
// Model Types
// ============================================================================

export type AIModelType = 'sonnet' | 'haiku' | 'opus'

export interface AIModel {
  id: string
  name: string
  type: AIModelType
  description: string
  inputCostPer1M: number // Cost per 1M input tokens
  outputCostPer1M: number // Cost per 1M output tokens
  maxTokens: number
  recommended: boolean
}

export const AI_MODELS: Record<AIModelType, AIModel> = {
  sonnet: {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    type: 'sonnet',
    description: 'Best balance of speed, cost, and quality',
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    maxTokens: 8192,
    recommended: true,
  },
  haiku: {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    type: 'haiku',
    description: 'Fastest and most cost-effective',
    inputCostPer1M: 1.0,
    outputCostPer1M: 5.0,
    maxTokens: 8192,
    recommended: false,
  },
  opus: {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    type: 'opus',
    description: 'Highest quality for complex tasks',
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    maxTokens: 8192,
    recommended: false,
  },
}
