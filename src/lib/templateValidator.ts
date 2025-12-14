/**
 * Template Validation Utility
 * Validates template structure before preview/load
 */

import type { Template, LegacyTemplate, TemplateMetadata } from '@/types/template'
import type { EmailBlock } from '@/types/email'

/**
 * Custom error class for template validation failures
 */
export class TemplateValidationError extends Error {
  constructor(
    message: string,
    public blockId?: string,
    public field?: string
  ) {
    super(message)
    this.name = 'TemplateValidationError'
  }
}

/**
 * Validates a template structure
 *
 * @param template - The template to validate (can be modern or legacy format)
 * @returns A validated Template object
 * @throws TemplateValidationError if validation fails
 */
export function validateTemplate(template: unknown): Template {
  if (!template || typeof template !== 'object') {
    throw new TemplateValidationError('Template must be an object')
  }

  const t = template as any

  // Check if this is a legacy template (no metadata property)
  if (!t.metadata) {
    return validateLegacyTemplate(t)
  }

  // Validate metadata
  if (!t.metadata.id || typeof t.metadata.id !== 'string') {
    throw new TemplateValidationError('Template missing required metadata.id')
  }

  if (!t.metadata.name || typeof t.metadata.name !== 'string') {
    throw new TemplateValidationError('Template missing required metadata.name')
  }

  if (!t.metadata.placeholders || typeof t.metadata.placeholders !== 'object') {
    throw new TemplateValidationError('Template missing required metadata.placeholders')
  }

  // Validate blocks array
  if (!Array.isArray(t.blocks)) {
    throw new TemplateValidationError('Template missing blocks array')
  }

  // Validate each block has id and type
  t.blocks.forEach((block: any, index: number) => {
    if (!block.id || typeof block.id !== 'string') {
      throw new TemplateValidationError(
        `Block at index ${index} missing id`,
        block.id
      )
    }

    if (!block.type || typeof block.type !== 'string') {
      throw new TemplateValidationError(
        `Block at index ${index} missing type`,
        block.id,
        'type'
      )
    }

    if (!block.data || typeof block.data !== 'object') {
      throw new TemplateValidationError(
        `Block ${block.id} missing data object`,
        block.id,
        'data'
      )
    }

    // Recursively validate nested blocks in layouts
    if (block.type === 'layout' && Array.isArray(block.data.children)) {
      validateNestedBlocks(block.data.children, block.id)
    }
  })

  // Validate settings
  if (!t.settings || typeof t.settings !== 'object') {
    throw new TemplateValidationError('Template missing settings object')
  }

  return t as Template
}

/**
 * Validates legacy template format and converts to modern format
 */
function validateLegacyTemplate(template: any): Template {
  // Validate required fields
  if (!template.id || typeof template.id !== 'string') {
    throw new TemplateValidationError('Legacy template missing id')
  }

  if (!template.name || typeof template.name !== 'string') {
    throw new TemplateValidationError('Legacy template missing name')
  }

  if (!Array.isArray(template.blocks)) {
    throw new TemplateValidationError('Legacy template missing blocks array')
  }

  if (!template.settings || typeof template.settings !== 'object') {
    throw new TemplateValidationError('Legacy template missing settings object')
  }

  // Convert to modern format with empty placeholders
  const metadata: TemplateMetadata = {
    id: template.id,
    version: 1,
    name: template.name,
    category: template.category || 'content',
    description: template.description,
    thumbnail: template.thumbnail,
    tags: template.tags || [],
    placeholders: {}, // Empty placeholders for legacy templates
  }

  return {
    metadata,
    blocks: template.blocks,
    settings: template.settings,
  }
}

/**
 * Validates nested blocks in layout blocks
 */
function validateNestedBlocks(blocks: any[], parentId: string): void {
  if (!Array.isArray(blocks)) {
    throw new TemplateValidationError(
      `Invalid children array in layout block`,
      parentId
    )
  }

  blocks.forEach((block: any, index: number) => {
    if (!block.id || typeof block.id !== 'string') {
      throw new TemplateValidationError(
        `Nested block at index ${index} in ${parentId} missing id`,
        parentId
      )
    }

    if (!block.type || typeof block.type !== 'string') {
      throw new TemplateValidationError(
        `Nested block ${block.id} in ${parentId} missing type`,
        block.id,
        'type'
      )
    }

    // Recursively validate deeper nesting
    if (block.type === 'layout' && Array.isArray(block.data?.children)) {
      validateNestedBlocks(block.data.children, block.id)
    }
  })
}

/**
 * Checks if a template is in legacy format
 */
export function isLegacyTemplate(template: unknown): template is LegacyTemplate {
  if (!template || typeof template !== 'object') {
    return false
  }

  const t = template as any
  return !t.metadata && t.id && t.name && Array.isArray(t.blocks)
}
