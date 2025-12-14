/**
 * Template Placeholder System
 * Converts templates with stock content to placeholder values using metadata mappings
 */

import { deepClone } from './utils/cloneUtils'
import type { Template } from '@/types/template'
import type { EmailBlock } from '@/types/email'
import {
  isHeadingBlock,
  isTextBlock,
  isImageBlock,
  isButtonBlock,
  isFooterBlock,
  isGalleryBlock,
  isLayoutBlock,
} from '@/types/email'

/**
 * Converts template with stock content to placeholder values
 * Uses metadata placeholders mapping (no regex pattern matching)
 *
 * @param template - The template with stock content
 * @returns A new template with placeholder values
 */
export function stripToPlaceholders(template: Template): Template {
  // Use structuredClone (NOT JSON.parse/stringify)
  const cloned = deepClone(template)

  // Process each block using metadata mappings
  // Cast is safe because we're mapping the same structure
  cloned.blocks = cloned.blocks.map((block) =>
    applyPlaceholdersToBlock(block as EmailBlock, template.metadata.placeholders)
  ) as any

  return cloned
}

/**
 * Apply placeholders to a single block (handles nested layouts)
 *
 * @param block - The block to process
 * @param placeholderMap - Placeholder mappings from template metadata
 * @returns The block with placeholders applied
 */
function applyPlaceholdersToBlock(
  block: EmailBlock,
  placeholderMap: Record<string, Record<string, string>>
): EmailBlock {
  const blockPlaceholders = placeholderMap[block.id]

  // No placeholders defined for this block - return as-is (but process nested children)
  if (!blockPlaceholders) {
    // Still process nested children in layout blocks
    if (isLayoutBlock(block)) {
      return {
        ...block,
        data: {
          ...block.data,
          children: block.data.children.map((child) =>
            applyPlaceholdersToBlock(child, placeholderMap)
          ),
        },
      }
    }
    return block
  }

  // Apply placeholders based on block type (type-safe using guards)
  if (isHeadingBlock(block)) {
    return {
      ...block,
      data: {
        ...block.data,
        text: blockPlaceholders.text ?? block.data.text,
      },
    }
  }

  if (isTextBlock(block)) {
    return {
      ...block,
      data: {
        ...block.data,
        content: blockPlaceholders.content ?? block.data.content,
      },
    }
  }

  if (isImageBlock(block)) {
    return {
      ...block,
      data: {
        ...block.data,
        src: blockPlaceholders.src ?? '',  // Empty for placeholder
        alt: blockPlaceholders.alt ?? block.data.alt,
        linkUrl: blockPlaceholders.linkUrl ?? block.data.linkUrl,
      },
    }
  }

  if (isButtonBlock(block)) {
    return {
      ...block,
      data: {
        ...block.data,
        text: blockPlaceholders.text ?? block.data.text,
        linkUrl: blockPlaceholders.linkUrl ?? block.data.linkUrl,
      },
    }
  }

  if (isFooterBlock(block)) {
    return {
      ...block,
      data: {
        ...block.data,
        companyName: blockPlaceholders.companyName ?? block.data.companyName,
        address: blockPlaceholders.address ?? block.data.address,
        legalText: blockPlaceholders.legalText ?? block.data.legalText,
      },
    }
  }

  if (isGalleryBlock(block)) {
    const images = block.data.images.map((img, index) => ({
      ...img,
      src: blockPlaceholders[`image${index}Src`] ?? '',  // Empty for placeholder
      alt: blockPlaceholders[`image${index}Alt`] ?? img.alt,
      linkUrl: blockPlaceholders[`image${index}LinkUrl`] ?? img.linkUrl,
    }))

    return {
      ...block,
      data: {
        ...block.data,
        images,
      },
    }
  }

  if (isLayoutBlock(block)) {
    return {
      ...block,
      data: {
        ...block.data,
        children: block.data.children.map((child) =>
          applyPlaceholdersToBlock(child, placeholderMap)
        ),
      },
    }
  }

  // For other block types (spacer, divider), return as-is
  return block
}

/**
 * Helper function to generate placeholder mappings for a template
 * Useful for creating new templates or converting legacy templates
 *
 * @param blocks - The template blocks (with or without order property)
 * @returns Suggested placeholder mappings
 */
export function generatePlaceholderMappings(
  blocks: (EmailBlock | Omit<EmailBlock, 'order'>)[]
): Record<string, Record<string, string>> {
  const mappings: Record<string, Record<string, string>> = {}

  blocks.forEach((block) => {
    const emailBlock = block as EmailBlock
    if (isHeadingBlock(emailBlock)) {
      mappings[emailBlock.id] = {
        text: '[Your Headline]',
      }
    } else if (isTextBlock(emailBlock)) {
      mappings[emailBlock.id] = {
        content: '<p>Add your text here...</p>',
      }
    } else if (isImageBlock(emailBlock)) {
      mappings[emailBlock.id] = {
        src: '',
        alt: 'Image description',
      }
    } else if (isButtonBlock(emailBlock)) {
      mappings[emailBlock.id] = {
        text: 'Click Here',
        linkUrl: 'https://example.com',
      }
    } else if (isFooterBlock(emailBlock)) {
      mappings[emailBlock.id] = {
        companyName: '[Your Company]',
        address: '[Your Address]',
        legalText: '© 2025 [Your Company]. All rights reserved.',
      }
    } else if (isGalleryBlock(emailBlock)) {
      const galleryMappings: Record<string, string> = {}
      emailBlock.data.images.forEach((_, index) => {
        galleryMappings[`image${index}Src`] = ''
        galleryMappings[`image${index}Alt`] = `Product ${index + 1}`
      })
      mappings[emailBlock.id] = galleryMappings
    } else if (isLayoutBlock(emailBlock)) {
      // Recursively process nested blocks
      const nestedMappings = generatePlaceholderMappings(emailBlock.data.children)
      Object.assign(mappings, nestedMappings)
    }
  })

  return mappings
}
