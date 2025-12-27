/**
 * Email Generator Service
 * Uses Claude to generate email blocks from user prompts
 */

import { nanoid } from 'nanoid'
import type { EmailBlock } from '@/types/email'
import type { GenerationContext, GenerationResult } from '../types/ai'
import { ClaudeService } from './ClaudeService'
import { getEmailGenerationPrompt } from '../prompts/systemPrompts'

export class EmailGenerator {
  private claude: ClaudeService

  constructor() {
    this.claude = new ClaudeService('sonnet')
  }

  /**
   * Generate email blocks from a user prompt
   */
  async generateEmail(
    prompt: string,
    context?: GenerationContext
  ): Promise<GenerationResult> {
    // Build system prompt with context
    const systemPrompt = getEmailGenerationPrompt(context?.templateType, {
      schoolName: context?.schoolName,
      audience: context?.audience,
      tone: context?.tone,
    })

    // Add brand colors to prompt if provided
    let enhancedPrompt = prompt
    if (context?.brandColors && context.brandColors.length > 0) {
      enhancedPrompt += `\n\nBrand colors to use: ${context.brandColors.join(', ')}`
    }

    // Generate JSON response
    const response = await this.claude.generateJSON<{
      blocks: any[]
      metadata?: {
        suggestedSubject?: string
        previewText?: string
        estimatedReadTime?: string
      }
    }>(enhancedPrompt, systemPrompt, {
      temperature: 1.0,
      maxTokens: 4096,
    })

    // Transform AI blocks to EmailBlock format
    const blocks: EmailBlock[] = response.data.blocks.map((block, index) =>
      this.transformToEmailBlock(block, index)
    )

    return {
      blocks,
      metadata: response.data.metadata,
      cost: response.cost,
      tokens: response.tokens,
    }
  }

  /**
   * Transform AI-generated block to EmailBlock format
   */
  private transformToEmailBlock(aiBlock: any, order: number): EmailBlock {
    const id = nanoid()

    // Ensure styles have proper structure
    const styles = {
      padding: aiBlock.styles?.padding || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      margin: aiBlock.styles?.margin,
      backgroundColor: aiBlock.styles?.backgroundColor,
      textAlign: aiBlock.styles?.textAlign || 'left',
    }

    return {
      id,
      type: aiBlock.type,
      order,
      data: aiBlock.data,
      styles,
    }
  }

  /**
   * Enhance existing content
   */
  async enhanceContent(
    content: string,
    enhancementType: string
  ): Promise<{
    enhanced: string
    cost: number
    tokens: { input: number; output: number }
  }> {
    const prompts: Record<string, string> = {
      grammar: 'Fix grammar and spelling errors in this text:',
      tone_professional: 'Rewrite this in a professional, formal tone:',
      tone_friendly: 'Rewrite this in a warm, friendly tone:',
      tone_urgent: 'Rewrite this with an urgent, time-sensitive tone:',
      simplify: 'Simplify this text for better readability:',
      expand: 'Expand this text with more details:',
      shorten: 'Make this text more concise:',
      inclusive: 'Make this language more inclusive and bias-free:',
    }

    const userPrompt = `${prompts[enhancementType] || prompts.grammar}\n\n${content}`

    const response = await this.claude.sendMessage(userPrompt, undefined, {
      temperature: 0.7,
      maxTokens: 2048,
    })

    return {
      enhanced: response.content.trim(),
      cost: response.cost,
      tokens: response.tokens,
    }
  }
}
