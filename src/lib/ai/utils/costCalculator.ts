/**
 * Cost Calculator Utility
 * Calculates costs for Claude API usage
 */

import type { CostEstimate, AIModelType } from '../types/ai'
import { AI_MODELS } from '../types/ai'

/**
 * Calculate cost for a given model and token usage
 */
export function calculateCost(
  modelType: AIModelType,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const model = AI_MODELS[modelType]

  const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M
  const totalCost = inputCost + outputCost

  return {
    inputCost,
    outputCost,
    totalCost,
    tokens: {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
    },
  }
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}

/**
 * Check if cost exceeds budget
 */
export function isBudgetExceeded(currentCost: number, budget: number): boolean {
  return currentCost >= budget
}

/**
 * Get budget percentage used
 */
export function getBudgetPercentage(currentCost: number, budget: number): number {
  return Math.min((currentCost / budget) * 100, 100)
}

/**
 * Get budget warning level
 */
export function getBudgetWarningLevel(
  currentCost: number,
  budget: number
): 'safe' | 'warning' | 'critical' | 'exceeded' {
  const percentage = getBudgetPercentage(currentCost, budget)

  if (percentage >= 100) return 'exceeded'
  if (percentage >= 80) return 'critical'
  if (percentage >= 50) return 'warning'
  return 'safe'
}
