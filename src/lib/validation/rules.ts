/**
 * Validation Rules
 * Individual validation rules for email accessibility, content, design, and deliverability
 */

import type { ValidationRule, ValidationIssue } from './types'
import type { EmailBlock, ImageBlockData, ImageGalleryBlockData, HeadingBlockData, TextBlockData } from '@/types/email'

// ============================================================================
// Accessibility Rules
// ============================================================================

/**
 * Check for images missing alt text
 */
export const imageAltTextRule: ValidationRule = {
  id: 'image-alt-text',
  name: 'Image Alt Text',
  description: 'All images should have descriptive alt text for accessibility',
  severity: 'error',
  category: 'accessibility',
  check: (email) => {
    const issues: ValidationIssue[] = []

    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'image') {
        const data = block.data as ImageBlockData
        if (!data.alt || data.alt.trim() === '') {
          issues.push({
            id: `${block.id}-no-alt`,
            ruleId: 'image-alt-text',
            severity: 'error',
            category: 'accessibility',
            message: 'Image is missing alt text',
            blockId: block.id,
            helpText: 'Alt text helps screen readers describe images to visually impaired users. Provide a brief, descriptive alt text for this image.',
          })
        }
      } else if (block.type === 'imageGallery') {
        const data = block.data as ImageGalleryBlockData
        data.images.forEach((image, index) => {
          if (!image.alt || image.alt.trim() === '') {
            issues.push({
              id: `${block.id}-gallery-${index}-no-alt`,
              ruleId: 'image-alt-text',
              severity: 'error',
              category: 'accessibility',
              message: `Gallery image ${index + 1} is missing alt text`,
              blockId: block.id,
              helpText: 'Each gallery image should have descriptive alt text.',
            })
          }
        })
      }
    })

    return issues
  },
}

/**
 * Check for heading level hierarchy
 */
export const headingHierarchyRule: ValidationRule = {
  id: 'heading-hierarchy',
  name: 'Heading Hierarchy',
  description: 'Headings should follow a logical hierarchy (H1 → H2 → H3)',
  severity: 'warning',
  category: 'accessibility',
  check: (email) => {
    const issues: ValidationIssue[] = []
    const headings: { level: number; blockId: string }[] = []

    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'heading') {
        const data = block.data as HeadingBlockData
        headings.push({ level: data.level, blockId: block.id })
      }
    })

    // Check for skipped heading levels
    for (let i = 0; i < headings.length - 1; i++) {
      const current = headings[i]
      const next = headings[i + 1]

      if (next.level > current.level + 1) {
        issues.push({
          id: `${next.blockId}-skipped-level`,
          ruleId: 'heading-hierarchy',
          severity: 'warning',
          category: 'accessibility',
          message: `Heading jumps from H${current.level} to H${next.level}, skipping H${current.level + 1}`,
          blockId: next.blockId,
          helpText: 'Screen readers use heading hierarchy to navigate content. Avoid skipping heading levels.',
        })
      }
    }

    return issues
  },
}

/**
 * Check for color contrast (simplified - checks common color combinations)
 */
export const colorContrastRule: ValidationRule = {
  id: 'color-contrast',
  name: 'Color Contrast',
  description: 'Text should have sufficient contrast ratio (WCAG AA: 4.5:1)',
  severity: 'warning',
  category: 'accessibility',
  check: (email) => {
    const issues: ValidationIssue[] = []

    // Helper function to calculate relative luminance
    const getLuminance = (hexColor: string): number => {
      const rgb = parseInt(hexColor.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff

      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    // Helper function to calculate contrast ratio
    const getContrastRatio = (color1: string, color2: string): number => {
      const l1 = getLuminance(color1)
      const l2 = getLuminance(color2)
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      return (lighter + 0.05) / (darker + 0.05)
    }

    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'text' || block.type === 'heading') {
        const data = block.data as TextBlockData | HeadingBlockData
        const textColor = data.color || '#000000'
        const bgColor = block.styles?.backgroundColor || email.settings?.backgroundColor || '#FFFFFF'

        // Only check if both colors are hex colors
        if (textColor.startsWith('#') && bgColor.startsWith('#')) {
          const ratio = getContrastRatio(textColor, bgColor)

          if (ratio < 4.5) {
            issues.push({
              id: `${block.id}-low-contrast`,
              ruleId: 'color-contrast',
              severity: 'warning',
              category: 'accessibility',
              message: `Text has low contrast ratio (${ratio.toFixed(2)}:1). WCAG AA requires 4.5:1`,
              blockId: block.id,
              helpText: 'Low contrast makes text hard to read for users with visual impairments. Choose colors with higher contrast.',
            })
          }
        }
      }
    })

    return issues
  },
}

// ============================================================================
// Content Rules
// ============================================================================

/**
 * Check for empty text blocks
 */
export const emptyTextRule: ValidationRule = {
  id: 'empty-text',
  name: 'Empty Text Blocks',
  description: 'Text blocks should not be empty',
  severity: 'warning',
  category: 'content',
  check: (email) => {
    const issues: ValidationIssue[] = []

    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'text') {
        const data = block.data as TextBlockData
        const textContent = data.content.replace(/<[^>]*>/g, '').trim()

        if (!textContent) {
          issues.push({
            id: `${block.id}-empty`,
            ruleId: 'empty-text',
            severity: 'warning',
            category: 'content',
            message: 'Text block is empty',
            blockId: block.id,
            helpText: 'Empty text blocks take up space without providing value. Consider removing or adding content.',
          })
        }
      } else if (block.type === 'heading') {
        const data = block.data as HeadingBlockData
        const textContent = data.text.replace(/<[^>]*>/g, '').trim()

        if (!textContent) {
          issues.push({
            id: `${block.id}-empty`,
            ruleId: 'empty-text',
            severity: 'warning',
            category: 'content',
            message: 'Heading is empty',
            blockId: block.id,
            helpText: 'Empty headings can confuse screen readers and users.',
          })
        }
      }
    })

    return issues
  },
}

/**
 * Check for spam trigger words
 */
export const spamWordsRule: ValidationRule = {
  id: 'spam-words',
  name: 'Spam Trigger Words',
  description: 'Avoid common spam trigger words that may affect deliverability',
  severity: 'info',
  category: 'content',
  check: (email) => {
    const issues: ValidationIssue[] = []

    const spamWords = [
      'free', 'winner', 'cash', 'prize', 'guaranteed',
      'click here', 'act now', 'limited time', 'urgent',
      'order now', 'buy now', 'call now', 'apply now',
      '100% free', 'risk free', 'no cost', 'no fees',
      'viagra', 'casino', 'lottery', 'weight loss',
    ]

    const checkText = (text: string, blockId: string, _blockType: string) => {
      const lowerText = text.toLowerCase()
      const foundWords = spamWords.filter(word => lowerText.includes(word.toLowerCase()))

      if (foundWords.length > 0) {
        issues.push({
          id: `${blockId}-spam-words`,
          ruleId: 'spam-words',
          severity: 'info',
          category: 'content',
          message: `Contains potential spam trigger words: ${foundWords.join(', ')}`,
          blockId: blockId,
          helpText: 'These words may trigger spam filters. Consider rephrasing if possible.',
        })
      }
    }

    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'text') {
        const data = block.data as TextBlockData
        const textContent = data.content.replace(/<[^>]*>/g, '')
        checkText(textContent, block.id, 'text')
      } else if (block.type === 'heading') {
        const data = block.data as HeadingBlockData
        checkText(data.text, block.id, 'heading')
      }
    })

    // Check subject line
    if (email.settings?.subject) {
      const foundWords = spamWords.filter(word =>
        email.settings.subject.toLowerCase().includes(word.toLowerCase())
      )

      if (foundWords.length > 0) {
        issues.push({
          id: 'subject-spam-words',
          ruleId: 'spam-words',
          severity: 'info',
          category: 'content',
          message: `Subject line contains potential spam trigger words: ${foundWords.join(', ')}`,
          helpText: 'Spam words in the subject line are particularly harmful to deliverability.',
        })
      }
    }

    return issues
  },
}

/**
 * Check for missing preheader
 */
export const preheaderRule: ValidationRule = {
  id: 'missing-preheader',
  name: 'Preheader Text',
  description: 'Emails should include preheader text for better engagement',
  severity: 'warning',
  category: 'content',
  check: (email) => {
    const issues: ValidationIssue[] = []

    if (!email.settings?.preheader || email.settings.preheader.trim() === '') {
      issues.push({
        id: 'no-preheader',
        ruleId: 'missing-preheader',
        severity: 'warning',
        category: 'content',
        message: 'Email is missing preheader text',
        helpText: 'Preheader text appears in the inbox preview next to the subject line. It\'s an opportunity to add context and improve open rates.',
      })
    }

    return issues
  },
}

// ============================================================================
// Design Rules
// ============================================================================

/**
 * Check for oversized images
 */
export const imageSizeRule: ValidationRule = {
  id: 'image-size',
  name: 'Image Size',
  description: 'Images should not be excessively large (recommended: <200KB per image)',
  severity: 'info',
  category: 'design',
  check: (email) => {
    const issues: ValidationIssue[] = []

    // Note: We can't actually check file size from src URL without fetching
    // This is a placeholder that could be enhanced with actual size checking
    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'image') {
        const data = block.data as ImageBlockData
        // Check for very wide images that might be large
        if (data.width && data.width > 1200) {
          issues.push({
            id: `${block.id}-large-width`,
            ruleId: 'image-size',
            severity: 'info',
            category: 'design',
            message: `Image width is ${data.width}px. Consider using smaller images for faster loading`,
            blockId: block.id,
            helpText: 'Large images can slow email loading, especially on mobile. Optimize images before uploading.',
          })
        }
      }
    })

    return issues
  },
}

/**
 * Check for mobile responsiveness indicators
 */
export const mobileOptimizationRule: ValidationRule = {
  id: 'mobile-optimization',
  name: 'Mobile Optimization',
  description: 'Emails should be optimized for mobile viewing',
  severity: 'info',
  category: 'design',
  check: (email) => {
    const issues: ValidationIssue[] = []

    // Check if email uses very small font sizes
    email.blocks.forEach((block: EmailBlock) => {
      if (block.type === 'text') {
        const data = block.data as TextBlockData
        const fontSize = parseInt(data.fontSize)
        if (fontSize < 14) {
          issues.push({
            id: `${block.id}-small-font`,
            ruleId: 'mobile-optimization',
            severity: 'info',
            category: 'design',
            message: `Text font size is ${fontSize}px. Consider using at least 14px for better mobile readability`,
            blockId: block.id,
            helpText: 'Small text is hard to read on mobile devices.',
          })
        }
      }
    })

    return issues
  },
}

// ============================================================================
// Export all rules
// ============================================================================

export const allRules: ValidationRule[] = [
  // Accessibility rules (highest priority)
  imageAltTextRule,
  headingHierarchyRule,
  colorContrastRule,

  // Content rules
  emptyTextRule,
  spamWordsRule,
  preheaderRule,

  // Design rules
  imageSizeRule,
  mobileOptimizationRule,
]
