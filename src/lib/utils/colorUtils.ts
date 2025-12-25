/**
 * Color Utilities
 * Functions for extracting and analyzing colors from email documents
 */

import type { EmailBlock, BrandColor } from '@/types/email'

/**
 * Extract all unique colors used in an email document
 * Scans all blocks for background colors, text colors, button colors, etc.
 */
export function extractDocumentColors(blocks: EmailBlock[]): string[] {
  const colors = new Set<string>()

  const extractFromBlock = (block: EmailBlock) => {
    // Extract from common styles
    if (block.styles.backgroundColor && block.styles.backgroundColor !== 'transparent') {
      colors.add(block.styles.backgroundColor.toUpperCase())
    }

    // Extract block-specific colors based on type
    switch (block.type) {
      case 'heading':
      case 'text':
        if (block.data.color) {
          colors.add(block.data.color.toUpperCase())
        }
        break

      case 'button':
        if (block.data.backgroundColor) {
          colors.add(block.data.backgroundColor.toUpperCase())
        }
        if (block.data.textColor) {
          colors.add(block.data.textColor.toUpperCase())
        }
        break

      case 'divider':
        if (block.data.color) {
          colors.add(block.data.color.toUpperCase())
        }
        break

      case 'footer':
        if (block.data.backgroundColor) {
          colors.add(block.data.backgroundColor.toUpperCase())
        }
        if (block.data.textColor) {
          colors.add(block.data.textColor.toUpperCase())
        }
        if (block.data.linkColor) {
          colors.add(block.data.linkColor.toUpperCase())
        }
        break

      case 'layout':
        // Recursively extract from child blocks
        if (block.data.children) {
          block.data.children.forEach(extractFromBlock)
        }
        break
    }
  }

  blocks.forEach(extractFromBlock)

  // Remove common default colors that are not meaningful
  const defaultColors = ['#FFFFFF', '#000000', 'TRANSPARENT']
  const meaningfulColors = Array.from(colors).filter(
    (color) => !defaultColors.includes(color.toUpperCase())
  )

  return meaningfulColors
}

/**
 * Find colors in the document that are not in the brand kit
 * Returns colors that could be added to maintain consistency
 */
export function findUnbrandedColors(
  blocks: EmailBlock[],
  brandColors: BrandColor[]
): string[] {
  const documentColors = extractDocumentColors(blocks)
  const brandColorSet = new Set(brandColors.map((bc) => bc.color.toUpperCase()))

  return documentColors.filter((color) => !brandColorSet.has(color.toUpperCase()))
}

/**
 * Generate a user-friendly name for a color based on its hex value
 * This is a simple implementation - can be enhanced with a color naming library
 */
export function generateColorName(hexColor: string): string {
  const hex = hexColor.toUpperCase().replace('#', '')

  // Simple color categorization based on hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Grayscale check
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
    if (r < 50) return 'Dark Gray'
    if (r < 100) return 'Gray'
    if (r < 150) return 'Medium Gray'
    if (r < 200) return 'Light Gray'
    return 'Very Light Gray'
  }

  // Find dominant color
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  // Low saturation (grayish)
  if (diff < 50) {
    return 'Muted Color'
  }

  // Determine hue
  if (r === max && g >= b) {
    if (g - b < 50) return 'Red'
    return 'Orange'
  }
  if (r === max && g < b) return 'Pink'
  if (g === max && r >= b) return 'Yellow Green'
  if (g === max && r < b) return 'Green'
  if (b === max && r >= g) return 'Purple'
  if (b === max && r < g) return 'Teal'

  return 'Color'
}
