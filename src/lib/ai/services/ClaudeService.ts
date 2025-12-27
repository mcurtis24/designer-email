/**
 * Claude Service
 * Main API client for Anthropic Claude
 */

import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import type { AIModelType, ClaudeServiceConfig } from '../types/ai'
import { AI_MODELS } from '../types/ai'
import { estimateTokens } from '../utils/tokenCounter'
import { calculateCost } from '../utils/costCalculator'
import { retryWithBackoff, toAIServiceError } from '../utils/errorHandler'

export class ClaudeService {
  private client: Anthropic
  private config: ClaudeServiceConfig
  private modelType: AIModelType

  constructor(modelType: AIModelType = 'sonnet') {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error(
        'VITE_ANTHROPIC_API_KEY is not configured. Please add your Anthropic API key to the .env file.'
      )
    }

    this.modelType = modelType
    const model = AI_MODELS[modelType]

    this.config = {
      apiKey,
      model: model.id,
      maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '4096'),
      temperature: 1.0,
    }

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      dangerouslyAllowBrowser: true, // For client-side usage (development only)
    })
  }

  /**
   * Send a single message to Claude
   */
  async sendMessage(
    userMessage: string,
    systemPrompt?: string,
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<{
    content: string
    cost: number
    tokens: { input: number; output: number }
  }> {
    try {
      const messages: MessageParam[] = [
        {
          role: 'user',
          content: userMessage,
        },
      ]

      const response = await retryWithBackoff(() =>
        this.client.messages.create({
          model: this.config.model,
          max_tokens: options?.maxTokens || this.config.maxTokens,
          temperature: options?.temperature ?? this.config.temperature,
          system: systemPrompt,
          messages,
        })
      )

      // Extract text content
      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as any).text)
        .join('\n')

      // Calculate cost
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      const costEstimate = calculateCost(this.modelType, inputTokens, outputTokens)

      return {
        content,
        cost: costEstimate.totalCost,
        tokens: {
          input: inputTokens,
          output: outputTokens,
        },
      }
    } catch (error) {
      throw toAIServiceError(error)
    }
  }

  /**
   * Send a conversation (multiple messages)
   */
  async sendConversation(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<{
    content: string
    cost: number
    tokens: { input: number; output: number }
  }> {
    try {
      const apiMessages: MessageParam[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await retryWithBackoff(() =>
        this.client.messages.create({
          model: this.config.model,
          max_tokens: options?.maxTokens || this.config.maxTokens,
          temperature: options?.temperature ?? this.config.temperature,
          system: systemPrompt,
          messages: apiMessages,
        })
      )

      // Extract text content
      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as any).text)
        .join('\n')

      // Calculate cost
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      const costEstimate = calculateCost(this.modelType, inputTokens, outputTokens)

      return {
        content,
        cost: costEstimate.totalCost,
        tokens: {
          input: inputTokens,
          output: outputTokens,
        },
      }
    } catch (error) {
      throw toAIServiceError(error)
    }
  }

  /**
   * Generate structured JSON output
   */
  async generateJSON<T = any>(
    userMessage: string,
    systemPrompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<{
    data: T
    cost: number
    tokens: { input: number; output: number }
  }> {
    try {
      const response = await this.sendMessage(userMessage, systemPrompt, options)

      // Parse JSON from response
      let data: T
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/)
        const jsonString = jsonMatch ? jsonMatch[1] : response.content
        data = JSON.parse(jsonString.trim())
      } catch (parseError) {
        throw new Error(
          `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        )
      }

      return {
        data,
        cost: response.cost,
        tokens: response.tokens,
      }
    } catch (error) {
      throw toAIServiceError(error)
    }
  }

  /**
   * Estimate cost for a message before sending
   */
  estimateCost(userMessage: string, systemPrompt?: string): number {
    const inputTokens = estimateTokens(userMessage) + (systemPrompt ? estimateTokens(systemPrompt) : 0)
    // Estimate output as 50% of input (conservative)
    const estimatedOutputTokens = Math.ceil(inputTokens * 0.5)

    const costEstimate = calculateCost(this.modelType, inputTokens, estimatedOutputTokens)
    return costEstimate.totalCost
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return AI_MODELS[this.modelType]
  }
}
