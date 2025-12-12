import type { EmailBlock } from '../types/email'

/**
 * Extract all unique colors used in the email blocks
 * Scans through all blocks and their properties to find color values
 */
export function extractDocumentColors(blocks: EmailBlock[]): string[] {
  const colors = new Set<string>()

  const addColor = (color: string | undefined) => {
    if (color && color.startsWith('#')) {
      colors.add(color.toUpperCase())
    }
  }

  blocks.forEach((block) => {
    // Common styles
    if (block.styles.backgroundColor) {
      addColor(block.styles.backgroundColor)
    }

    // Block-specific colors
    switch (block.type) {
      case 'heading':
        addColor(block.data.color)
        break
      case 'text':
        addColor(block.data.color)
        // TODO: Could also extract colors from HTML content if needed
        break
      case 'button':
        addColor(block.data.backgroundColor)
        addColor(block.data.textColor)
        break
      case 'divider':
        addColor(block.data.color)
        break
      case 'layout':
        // Recursively extract from nested blocks
        if (block.data.children) {
          const nestedColors = extractDocumentColors(block.data.children)
          nestedColors.forEach((color) => colors.add(color))
        }
        break
    }
  })

  return Array.from(colors)
}

/**
 * Parse color from various formats and normalize to hex
 */
export function normalizeColor(color: string): string {
  // If already hex, return uppercase
  if (color.startsWith('#')) {
    return color.toUpperCase()
  }

  // TODO: Add support for rgb(), rgba(), named colors if needed
  return color
}

/**
 * Check if a color is light or dark (for contrast)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? '#000000' : '#FFFFFF'
}
