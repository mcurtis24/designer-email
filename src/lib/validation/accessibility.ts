import { EmailDocument, EmailBlock, ImageBlockData, ImageGalleryBlockData, GalleryImage } from '@/types/email'

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
  email.blocks.forEach((block) => {
    issues.push(...validateBlock(block))
  })

  return issues
}

/**
 * Validates a single block for accessibility issues
 */
function validateBlock(block: EmailBlock): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  switch (block.type) {
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
        layoutData.children.forEach((childBlock: EmailBlock) => {
          issues.push(...validateBlock(childBlock))
        })
      }
      break
  }

  return issues
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
