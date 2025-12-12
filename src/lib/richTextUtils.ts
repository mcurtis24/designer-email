/**
 * Rich Text Utilities
 * Helper functions for text formatting with email-safe HTML output
 */

/**
 * Wraps selected text with a tag and inline styles
 * Returns modified HTML content
 */
export function applyFormatToSelection(
  contentEditableElement: HTMLElement,
  command: string,
  value?: string
): string {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return contentEditableElement.innerHTML
  }

  const range = selection.getRangeAt(0)

  // Check if selection is within the contentEditable element
  if (!contentEditableElement.contains(range.commonAncestorContainer)) {
    return contentEditableElement.innerHTML
  }

  // If nothing is selected, don't do anything
  if (range.collapsed) {
    return contentEditableElement.innerHTML
  }

  const selectedText = range.toString()
  let wrappedContent: HTMLElement

  switch (command) {
    case 'bold':
      wrappedContent = document.createElement('strong')
      wrappedContent.style.fontWeight = 'bold'
      wrappedContent.textContent = selectedText
      break

    case 'italic':
      wrappedContent = document.createElement('em')
      wrappedContent.style.fontStyle = 'italic'
      wrappedContent.textContent = selectedText
      break

    case 'underline':
      wrappedContent = document.createElement('span')
      wrappedContent.style.textDecoration = 'underline'
      wrappedContent.textContent = selectedText
      break

    case 'link':
      if (!value) return contentEditableElement.innerHTML
      wrappedContent = document.createElement('a')
      wrappedContent.setAttribute('href', value)
      wrappedContent.setAttribute('target', '_blank')
      wrappedContent.setAttribute('rel', 'noopener noreferrer')
      wrappedContent.style.color = '#0066cc'
      wrappedContent.style.textDecoration = 'underline'
      wrappedContent.textContent = selectedText
      break

    case 'color':
      if (!value) return contentEditableElement.innerHTML
      wrappedContent = document.createElement('span')
      wrappedContent.style.color = value
      wrappedContent.textContent = selectedText
      break

    case 'fontFamily':
      if (!value) return contentEditableElement.innerHTML
      wrappedContent = document.createElement('span')
      wrappedContent.style.fontFamily = value
      wrappedContent.textContent = selectedText
      break

    case 'align':
      // For alignment, we need to wrap in a div or update parent
      if (!value) return contentEditableElement.innerHTML
      const alignWrapper = document.createElement('div')
      alignWrapper.style.textAlign = value
      alignWrapper.textContent = selectedText
      range.deleteContents()
      range.insertNode(alignWrapper)
      selection.removeAllRanges()
      return contentEditableElement.innerHTML

    case 'insertUnorderedList':
    case 'insertOrderedList':
      // For lists, use execCommand which handles the complexity
      document.execCommand(command, false)
      return contentEditableElement.innerHTML

    default:
      return contentEditableElement.innerHTML
  }

  // Replace selection with wrapped content
  range.deleteContents()
  range.insertNode(wrappedContent)

  // Clear selection
  selection.removeAllRanges()

  return contentEditableElement.innerHTML
}

/**
 * Cleans HTML to ensure it's email-safe
 * Removes classes, converts styles to inline, removes unsupported tags
 */
export function sanitizeEmailHTML(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // Remove all class attributes
  body.querySelectorAll('[class]').forEach((el) => {
    el.removeAttribute('class')
  })

  // Convert FONT tags to SPAN with inline styles (font tags are created by document.execCommand('fontName'))
  body.querySelectorAll('font').forEach((font) => {
    const span = document.createElement('span')
    const face = font.getAttribute('face')
    const size = font.getAttribute('size')
    const color = font.getAttribute('color')

    if (face) span.style.fontFamily = face
    if (size) {
      // Convert font size attribute to pixels (1=10px, 2=13px, 3=16px, 4=18px, 5=24px, 6=32px, 7=48px)
      const sizeMap: Record<string, string> = { '1': '10px', '2': '13px', '3': '16px', '4': '18px', '5': '24px', '6': '32px', '7': '48px' }
      span.style.fontSize = sizeMap[size] || '16px'
    }
    if (color) span.style.color = color

    // Preserve any existing inline styles
    const existingStyle = font.getAttribute('style')
    if (existingStyle) {
      span.setAttribute('style', existingStyle + '; ' + span.getAttribute('style'))
    }

    span.innerHTML = font.innerHTML
    font.replaceWith(span)
  })

  // Remove unsupported tags (keep only: strong, em, a, span, br, p, u, ul, ol, li, div)
  const allowedTags = ['STRONG', 'EM', 'A', 'SPAN', 'BR', 'P', 'B', 'I', 'U', 'UL', 'OL', 'LI', 'DIV']
  body.querySelectorAll('*').forEach((el) => {
    if (!allowedTags.includes(el.tagName)) {
      // Replace with span if it has styles, otherwise unwrap
      if (el.getAttribute('style')) {
        const span = document.createElement('span')
        span.setAttribute('style', el.getAttribute('style') || '')
        span.innerHTML = el.innerHTML
        el.replaceWith(span)
      } else {
        // Unwrap element (keep children)
        const parent = el.parentNode
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el)
        }
        parent?.removeChild(el)
      }
    }
  })

  // Convert <b> to <strong> and <i> to <em> for consistency
  body.querySelectorAll('b').forEach((el) => {
    const strong = document.createElement('strong')
    strong.style.fontWeight = 'bold'
    strong.innerHTML = el.innerHTML
    el.replaceWith(strong)
  })

  body.querySelectorAll('i').forEach((el) => {
    const em = document.createElement('em')
    em.style.fontStyle = 'italic'
    em.innerHTML = el.innerHTML
    el.replaceWith(em)
  })

  // Ensure all links have inline styles
  body.querySelectorAll('a').forEach((link) => {
    if (!link.style.color) {
      link.style.color = '#0066cc'
    }
    if (!link.style.textDecoration) {
      link.style.textDecoration = 'underline'
    }
    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank')
    }
    if (!link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return body.innerHTML
}

/**
 * Strips all HTML tags and returns plain text
 */
export function stripHTML(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

/**
 * Converts plain text to HTML with line breaks
 */
export function textToHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
