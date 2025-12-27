import { EmailDocument, EmailBlock, ImageBlockData, ImageGalleryBlockData, GalleryImage, HeadingBlockData, TextBlockData, ButtonBlockData } from '@/types/email'

export interface AccessibilityIssue {
  id: string
  blockId: string
  blockType: string
  severity: 'error' | 'warning'
  message: string
  suggestion: string
}

/**
 * Validates email for accessibility issues
 * Returns array of issues found
 */
export function validateAccessibility(email: EmailDocument): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  // Check all blocks for accessibility issues
  email.blocks.forEach((block, index) => {
    issues.push(...validateBlock(block, index, email.blocks))
  })

  return issues
}

/**
 * Validates a single block for accessibility issues
 */
function validateBlock(block: EmailBlock, blockIndex: number = 0, allBlocks: EmailBlock[] = []): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  switch (block.type) {
    case 'heading':
      issues.push(...validateHeadingBlock(block, blockIndex, allBlocks))
      break
    case 'text':
      issues.push(...validateTextBlock(block))
      break
    case 'button':
      issues.push(...validateButtonBlock(block))
      break
    case 'image':
      issues.push(...validateImageBlock(block))
      break
    case 'imageGallery':
      issues.push(...validateGalleryBlock(block))
      break
    case 'layout':
      // Recursively check layout children
      const layoutData = block.data as any
      if (layoutData.children && Array.isArray(layoutData.children)) {
        layoutData.children.forEach((childBlock: EmailBlock, childIndex: number) => {
          issues.push(...validateBlock(childBlock, childIndex, layoutData.children))
        })
      }
      break
  }

  return issues
}

/**
 * Validates heading block for proper hierarchy and contrast
 */
function validateHeadingBlock(block: EmailBlock, blockIndex: number, allBlocks: EmailBlock[]): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const data = block.data as HeadingBlockData

  // Check heading hierarchy
  if (blockIndex > 0) {
    // Find previous heading
    for (let i = blockIndex - 1; i >= 0; i--) {
      const prevBlock = allBlocks[i]
      if (prevBlock && prevBlock.type === 'heading') {
        const prevData = prevBlock.data as HeadingBlockData
        const levelDiff = data.level - prevData.level

        // Check if we skipped a heading level (e.g., H1 → H3)
        if (levelDiff > 1) {
          issues.push({
            id: `${block.id}-heading-hierarchy`,
            blockId: block.id,
            blockType: 'heading',
            severity: 'error',
            message: `Heading hierarchy skipped from H${prevData.level} to H${data.level}`,
            suggestion: `Use H${prevData.level + 1} instead of H${data.level} to maintain proper document structure for screen readers.`,
          })
        }
        break
      }
    }
  }

  // Check color contrast
  const backgroundColor = block.styles.backgroundColor || '#ffffff'
  const textColor = data.color || '#000000'
  const contrastRatio = getContrastRatio(textColor, backgroundColor)

  // Large text (18pt+ or 14pt+ bold) needs 3:1, normal text needs 4.5:1
  const isLargeText = parseInt(data.fontSize) >= 18 || (parseInt(data.fontSize) >= 14 && data.fontWeight >= 700)
  const minimumRatio = isLargeText ? 3.0 : 4.5

  if (contrastRatio < minimumRatio) {
    issues.push({
      id: `${block.id}-contrast`,
      blockId: block.id,
      blockType: 'heading',
      severity: 'error',
      message: `Heading color contrast ${contrastRatio.toFixed(2)}:1 is below minimum ${minimumRatio}:1`,
      suggestion: `Increase contrast between text (${textColor}) and background (${backgroundColor}). WCAG 2.2 requires ${minimumRatio}:1 for ${isLargeText ? 'large' : 'normal'} text.`,
    })
  } else if (contrastRatio < minimumRatio + 0.5) {
    issues.push({
      id: `${block.id}-contrast-warning`,
      blockId: block.id,
      blockType: 'heading',
      severity: 'warning',
      message: `Heading color contrast ${contrastRatio.toFixed(2)}:1 is just above minimum ${minimumRatio}:1`,
      suggestion: 'Consider increasing contrast for better readability, especially in bright environments.',
    })
  }

  // Check line height
  if (data.lineHeight && data.lineHeight < 1.5) {
    issues.push({
      id: `${block.id}-line-height`,
      blockId: block.id,
      blockType: 'heading',
      severity: 'warning',
      message: `Heading line height ${data.lineHeight} is below recommended 1.5`,
      suggestion: 'WCAG 2.2 recommends line height of at least 1.5 for better readability.',
    })
  }

  return issues
}

/**
 * Validates text block for contrast and readability
 */
function validateTextBlock(block: EmailBlock): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const data = block.data as TextBlockData

  // Check color contrast
  const backgroundColor = block.styles.backgroundColor || '#ffffff'
  const textColor = data.color || '#000000'
  const contrastRatio = getContrastRatio(textColor, backgroundColor)

  // Body text always needs 4.5:1
  const minimumRatio = 4.5

  if (contrastRatio < minimumRatio) {
    issues.push({
      id: `${block.id}-contrast`,
      blockId: block.id,
      blockType: 'text',
      severity: 'error',
      message: `Text color contrast ${contrastRatio.toFixed(2)}:1 is below minimum ${minimumRatio}:1`,
      suggestion: `Increase contrast between text (${textColor}) and background (${backgroundColor}). WCAG 2.2 requires ${minimumRatio}:1 for body text.`,
    })
  }

  // Check line height
  if (data.lineHeight && data.lineHeight < 1.5) {
    issues.push({
      id: `${block.id}-line-height`,
      blockId: block.id,
      blockType: 'text',
      severity: 'warning',
      message: `Text line height ${data.lineHeight} is below recommended 1.5`,
      suggestion: 'WCAG 2.2 recommends line height of at least 1.5 for better readability.',
    })
  }

  // Check for "click here" or other non-descriptive link text
  const textContent = data.content.toLowerCase()
  const nonDescriptivePatterns = [
    /click here/i,
    /read more/i,
    /learn more/i,
    /^here$/i,
    /^link$/i,
    /^more$/i,
  ]

  if (nonDescriptivePatterns.some(pattern => pattern.test(textContent))) {
    issues.push({
      id: `${block.id}-link-text`,
      blockId: block.id,
      blockType: 'text',
      severity: 'warning',
      message: 'Text may contain non-descriptive link text like "click here" or "read more"',
      suggestion: 'Use descriptive link text that explains where the link goes (e.g., "View our product catalog" instead of "click here").',
    })
  }

  return issues
}

/**
 * Validates button block for contrast and descriptive text
 */
function validateButtonBlock(block: EmailBlock): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const data = block.data as ButtonBlockData

  // Check color contrast
  const backgroundColor = data.backgroundColor || '#3B82F6'
  const textColor = data.textColor || '#ffffff'
  const contrastRatio = getContrastRatio(textColor, backgroundColor)

  // Buttons need 4.5:1 contrast
  const minimumRatio = 4.5

  if (contrastRatio < minimumRatio) {
    issues.push({
      id: `${block.id}-contrast`,
      blockId: block.id,
      blockType: 'button',
      severity: 'error',
      message: `Button color contrast ${contrastRatio.toFixed(2)}:1 is below minimum ${minimumRatio}:1`,
      suggestion: `Increase contrast between button text (${textColor}) and background (${backgroundColor}).`,
    })
  }

  // Check for non-descriptive button text
  const buttonText = data.text.toLowerCase().trim()
  const nonDescriptiveTerms = ['click here', 'here', 'submit', 'go', 'ok', 'yes', 'no']

  if (nonDescriptiveTerms.includes(buttonText)) {
    issues.push({
      id: `${block.id}-button-text`,
      blockId: block.id,
      blockType: 'button',
      severity: 'warning',
      message: `Button text "${data.text}" is not descriptive`,
      suggestion: 'Use descriptive button text that explains the action (e.g., "Download Report" instead of "Submit").',
    })
  }

  // Check button size (touch target should be at least 44x44px)
  // Note: This is a simplified check based on padding
  const minPadding = 12
  const topPadding = parseInt(data.padding?.top || '0') || 0
  const bottomPadding = parseInt(data.padding?.bottom || '0') || 0
  const totalVerticalPadding = topPadding + bottomPadding

  if (totalVerticalPadding < minPadding) {
    issues.push({
      id: `${block.id}-touch-target`,
      blockId: block.id,
      blockType: 'button',
      severity: 'warning',
      message: 'Button padding may be too small for comfortable touch targets',
      suggestion: 'WCAG 2.2 recommends touch targets of at least 44x44px. Increase button padding for better mobile accessibility.',
    })
  }

  return issues
}

/**
 * Calculates contrast ratio between two colors
 * Based on WCAG 2.2 guidelines
 */
function getContrastRatio(foreground: string, background: string): number {
  const fgLuminance = getRelativeLuminance(foreground)
  const bgLuminance = getRelativeLuminance(background)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculates relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // Calculate luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
}

/**
 * Validates image block for missing or poor alt text
 */
function validateImageBlock(block: EmailBlock): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const data = block.data as ImageBlockData

  // Check for missing alt text
  if (!data.alt || data.alt.trim() === '') {
    issues.push({
      id: `${block.id}-missing-alt`,
      blockId: block.id,
      blockType: 'image',
      severity: 'error',
      message: 'Image is missing alt text',
      suggestion: 'Add descriptive alt text for screen readers and when images fail to load. Describe what the image shows or its purpose in the email.',
    })
  }
  // Check for generic/unhelpful alt text
  else if (isGenericAltText(data.alt)) {
    issues.push({
      id: `${block.id}-generic-alt`,
      blockId: block.id,
      blockType: 'image',
      severity: 'warning',
      message: `Alt text is too generic: "${data.alt}"`,
      suggestion: 'Use more descriptive alt text. Instead of "image" or "photo", describe what the image shows or represents.',
    })
  }
  // Check for alt text that's too long
  else if (data.alt.length > 125) {
    issues.push({
      id: `${block.id}-long-alt`,
      blockId: block.id,
      blockType: 'image',
      severity: 'warning',
      message: 'Alt text is very long (125+ characters)',
      suggestion: 'Keep alt text concise (under 125 characters). Describe the essential information the image conveys.',
    })
  }

  return issues
}

/**
 * Validates gallery block for missing alt text on images
 */
function validateGalleryBlock(block: EmailBlock): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  const data = block.data as ImageGalleryBlockData

  if (!data.images || data.images.length === 0) {
    return issues
  }

  // Check each image in the gallery
  data.images.forEach((image: GalleryImage, index: number) => {
    if (!image.alt || image.alt.trim() === '') {
      issues.push({
        id: `${block.id}-image-${index}-missing-alt`,
        blockId: block.id,
        blockType: 'imageGallery',
        severity: 'error',
        message: `Gallery image ${index + 1} is missing alt text`,
        suggestion: 'Add descriptive alt text to each gallery image for accessibility.',
      })
    } else if (isGenericAltText(image.alt)) {
      issues.push({
        id: `${block.id}-image-${index}-generic-alt`,
        blockId: block.id,
        blockType: 'imageGallery',
        severity: 'warning',
        message: `Gallery image ${index + 1} has generic alt text: "${image.alt}"`,
        suggestion: 'Use more descriptive alt text for each gallery image.',
      })
    }
  })

  return issues
}

/**
 * Checks if alt text is generic/unhelpful
 */
function isGenericAltText(alt: string): boolean {
  const genericTerms = [
    'image',
    'photo',
    'picture',
    'img',
    'graphic',
    'icon',
    'screenshot',
    'banner',
    'untitled',
    'placeholder',
  ]

  const normalized = alt.toLowerCase().trim()

  // Check if alt text is ONLY a generic term
  return genericTerms.some((term) => normalized === term)
}

/**
 * Gets count of issues by severity
 */
export function getIssueCounts(issues: AccessibilityIssue[]): {
  errors: number
  warnings: number
  total: number
} {
  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length

  return {
    errors,
    warnings,
    total: issues.length,
  }
}

/**
 * Checks if email has any accessibility issues
 */
export function hasAccessibilityIssues(email: EmailDocument): boolean {
  const issues = validateAccessibility(email)
  return issues.length > 0
}
