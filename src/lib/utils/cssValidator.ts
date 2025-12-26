/**
 * CSS Validator Utility
 * Validates CSS values before injecting into HTML to prevent broken email rendering
 */

/**
 * Validates CSS length values (px, em, rem, %, pt)
 * @param value - CSS length value to validate
 * @returns true if valid, false otherwise
 */
export function isValidCSSLength(value: string | undefined): boolean {
  if (!value) return false
  return /^\d+(\.\d+)?(px|em|rem|%|pt)$/.test(value.trim())
}

/**
 * Validates CSS color values (hex, rgb, rgba, named colors)
 * @param value - CSS color value to validate
 * @returns true if valid, false otherwise
 */
export function isValidCSSColor(value: string | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()

  // Hex colors: #fff or #ffffff
  const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/

  // RGB/RGBA: rgb(255, 255, 255) or rgba(255, 255, 255, 0.5)
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/

  // Named colors
  const namedColors = ['transparent', 'inherit', 'currentColor']

  return hexPattern.test(trimmed) ||
         rgbPattern.test(trimmed) ||
         namedColors.includes(trimmed)
}

/**
 * Validates CSS text-align values
 * @param value - CSS text-align value to validate
 * @returns true if valid, false otherwise
 */
export function isValidTextAlign(value: string | undefined): boolean {
  if (!value) return false
  const validValues = ['left', 'center', 'right', 'justify']
  return validValues.includes(value.trim())
}

/**
 * Validates line height (number or length)
 * @param value - CSS line-height value to validate
 * @returns true if valid, false otherwise
 */
export function isValidLineHeight(value: string | number | undefined): boolean {
  if (value === undefined) return false

  // Number (unitless)
  if (typeof value === 'number') {
    return value >= 0
  }

  // String with units
  const trimmed = value.trim()
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(trimmed)
}

/**
 * Sanitizes CSS value by escaping potentially dangerous characters
 * DEPRECATED: Use type-specific validators (isValidCSSColor, isValidCSSLength, etc.) instead
 * This function provides defense-in-depth but should not be relied upon as primary validation
 * @param value - CSS value to sanitize
 * @returns sanitized CSS value
 */
export function sanitizeCSSValue(value: string): string {
  if (!value || typeof value !== 'string') return ''

  // Remove semicolons to prevent style injection escaping
  // Remove potentially dangerous characters
  // Keep valid CSS characters: letters, numbers, #, %, ., -, spaces, commas
  return value
    .replace(/;/g, '') // Prevent breaking out of style attribute
    .replace(/[<>{}()]/g, '') // Remove brackets and braces
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/expression\(/gi, '') // Remove IE expression() attacks
    .trim()
}
