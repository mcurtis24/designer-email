/**
 * HTML and URL Sanitization Utilities
 *
 * CRITICAL SECURITY: These functions prevent XSS attacks by sanitizing user input
 * before it's injected into generated HTML emails.
 *
 * All user-controlled content MUST pass through these functions before HTML generation.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content to allow safe formatting tags while blocking XSS
 * Use this for rich text content that may contain bold, italic, links, etc.
 *
 * @example
 * sanitizeHTML('<strong>Bold</strong> <script>alert("xss")</script>')
 * // Returns: '<strong>Bold</strong> '
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'br', 'p', 'b', 'i', 'span'],
    ALLOWED_ATTR: ['href', 'style', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * Escapes HTML special characters to prevent XSS injection
 * Use this for plain text content that should be displayed as-is
 *
 * @example
 * escapeHTML('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHTML(text: string): string {
  if (!text) return ''

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitizes URLs to prevent javascript: and data: URI attacks
 * Only allows http:, https:, and mailto: protocols
 *
 * @example
 * sanitizeURL('javascript:alert(1)') // Returns: '#'
 * sanitizeURL('https://example.com') // Returns: 'https://example.com'
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') return '#'

  // Trim whitespace and convert to lowercase for protocol check
  const trimmedUrl = url.trim()

  // Allow relative URLs (starting with / or #)
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
    return trimmedUrl
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(trimmedUrl)

    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:']
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`Blocked unsafe URL protocol: ${parsed.protocol}`)
      return '#'
    }

    return trimmedUrl
  } catch (error) {
    // Invalid URL format - could be relative or malformed
    // Be safe and block it
    console.warn('Invalid URL format:', trimmedUrl)
    return '#'
  }
}

/**
 * Sanitizes color values to prevent CSS injection
 * Allows hex colors, rgb/rgba, and named colors
 *
 * @example
 * sanitizeColor('#ff0000') // Returns: '#ff0000'
 * sanitizeColor('red; position:fixed;') // Returns: null
 */
export function sanitizeColor(color: string): string | null {
  if (!color || typeof color !== 'string') return null

  const trimmed = color.trim()

  // Hex colors: #RGB or #RRGGBB
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return trimmed
  }

  // RGB/RGBA colors
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(trimmed)) {
    return trimmed
  }

  // Named colors (basic set for email safety)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'gray', 'grey', 'transparent', 'navy', 'teal', 'aqua', 'lime',
    'maroon', 'olive', 'silver', 'fuchsia'
  ]

  if (namedColors.includes(trimmed.toLowerCase())) {
    return trimmed.toLowerCase()
  }

  console.warn('Invalid color value:', color)
  return null
}

/**
 * Sanitizes CSS length values (px, em, rem, %, pt)
 * Prevents injection of arbitrary CSS
 *
 * @example
 * sanitizeLength('16px') // Returns: '16px'
 * sanitizeLength('100%; position:fixed;') // Returns: null
 */
export function sanitizeLength(length: string): string | null {
  if (!length || typeof length !== 'string') return null

  const trimmed = length.trim()

  // Valid length units for email
  if (/^\d+(\.\d+)?(px|em|rem|%|pt)$/.test(trimmed)) {
    return trimmed
  }

  // Also allow '0' without unit
  if (trimmed === '0') {
    return '0'
  }

  console.warn('Invalid length value:', length)
  return null
}

/**
 * Sanitizes text-align values
 */
export function sanitizeTextAlign(align: string): string | null {
  if (!align || typeof align !== 'string') return null

  const validAlignments = ['left', 'center', 'right', 'justify']
  const trimmed = align.trim().toLowerCase()

  if (validAlignments.includes(trimmed)) {
    return trimmed
  }

  console.warn('Invalid text-align value:', align)
  return null
}

/**
 * Sanitizes line-height values
 */
export function sanitizeLineHeight(lineHeight: string | number): string | null {
  if (!lineHeight) return null

  // Allow numeric values (unitless line-height)
  if (typeof lineHeight === 'number') {
    if (lineHeight >= 0.5 && lineHeight <= 3) {
      return String(lineHeight)
    }
    return null
  }

  const trimmed = String(lineHeight).trim()

  // Allow unitless numbers
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const num = parseFloat(trimmed)
    if (num >= 0.5 && num <= 3) {
      return trimmed
    }
  }

  // Allow px, em, rem, %
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(trimmed)) {
    return trimmed
  }

  console.warn('Invalid line-height value:', lineHeight)
  return null
}

/**
 * Sanitizes font-family values
 * Only allows safe, email-compatible fonts
 */
export function sanitizeFontFamily(fontFamily: string): string | null {
  if (!fontFamily || typeof fontFamily !== 'string') return null

  // Email-safe fonts
  const safeFonts = [
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
    'sans-serif',
    'serif',
    'monospace'
  ]

  // Font family can be comma-separated with fallbacks
  const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''))

  // Check if at least the primary font is safe
  const primaryFont = fonts[0]
  const isSafe = safeFonts.some(safe =>
    primaryFont.toLowerCase().includes(safe.toLowerCase())
  )

  if (isSafe) {
    return fontFamily
  }

  console.warn('Unsafe font-family:', fontFamily)
  // Return safe fallback
  return 'Arial, Helvetica, sans-serif'
}

/**
 * Builds inline CSS style string with sanitized values
 * Use this to safely construct style attributes for HTML elements
 *
 * @example
 * buildInlineStyle({
 *   color: '#ff0000',
 *   fontSize: '16px',
 *   malicious: 'red; position:fixed;' // Will be ignored
 * })
 */
export function buildInlineStyle(styles: Record<string, string | number | undefined | null>): string {
  const sanitizedStyles: string[] = []

  for (const [property, value] of Object.entries(styles)) {
    if (!value) continue

    let sanitizedValue: string | null = null

    // Sanitize based on property type
    switch (property) {
      case 'color':
      case 'backgroundColor':
      case 'borderColor':
        sanitizedValue = sanitizeColor(String(value))
        break

      case 'fontSize':
      case 'width':
      case 'height':
      case 'padding':
      case 'margin':
      case 'borderWidth':
      case 'borderRadius':
        sanitizedValue = sanitizeLength(String(value))
        break

      case 'textAlign':
        sanitizedValue = sanitizeTextAlign(String(value))
        break

      case 'lineHeight':
        sanitizedValue = sanitizeLineHeight(value)
        break

      case 'fontFamily':
        sanitizedValue = sanitizeFontFamily(String(value))
        break

      default:
        // For unknown properties, be conservative and skip
        console.warn('Unknown CSS property, skipping:', property)
        continue
    }

    if (sanitizedValue) {
      // Convert camelCase to kebab-case for CSS
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
      sanitizedStyles.push(`${cssProperty}: ${sanitizedValue}`)
    }
  }

  return sanitizedStyles.join('; ')
}
