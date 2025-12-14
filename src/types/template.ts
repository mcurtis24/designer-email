/**
 * Template Type Definitions
 * Defines the structure for email templates with metadata and placeholder mappings
 */

import type { EmailBlock } from './email'

/**
 * Template settings (compatible with EmailSettings but more flexible)
 */
export interface TemplateSettings {
  subject?: string
  preheader?: string
  width?: number
  contentWidth?: number
  backgroundColor: string
  fontFamily: string
  textColor: string
  brandColors?: string[]
}

/**
 * Template metadata with placeholder mappings
 */
export interface TemplateMetadata {
  id: string
  version: number
  name: string
  category: 'newsletter' | 'promotion' | 'transactional' | 'announcement' | 'event' | 'content' | 'retention'
  description?: string
  thumbnail?: string
  tags?: string[]

  /**
   * Explicit placeholder mappings for each block
   * Format: { [blockId]: { [field]: placeholderValue } }
   *
   * Example:
   * {
   *   "heading-1": { "text": "[Your Headline]" },
   *   "footer-1": { "companyName": "[Your Company]", "address": "[Your Address]" }
   * }
   */
  placeholders: Record<string, Record<string, string>>

  createdAt?: Date
  updatedAt?: Date
}

/**
 * Complete template structure (modern format)
 *
 * Note: Blocks in templates don't have the `order` property,
 * it's added at load time
 */
export interface Template {
  metadata: TemplateMetadata
  blocks: Omit<EmailBlock, 'order'>[]
  settings: TemplateSettings
}

/**
 * Legacy template format (for backward compatibility)
 * Old templates without metadata structure
 *
 * Note: Blocks in templates don't have the `order` property,
 * it's added at load time
 */
export interface LegacyTemplate {
  id: string
  name: string
  category: string
  description?: string
  thumbnail?: string
  tags?: string[]
  blocks: Omit<EmailBlock, 'order'>[]
  settings: TemplateSettings
}
