/**
 * Type Guard Functions
 *
 * These functions provide type narrowing for EmailBlock discriminated union
 * to eliminate the need for "as any" casts throughout the codebase.
 */

import type {
  EmailBlock,
  HeadingBlockData,
  TextBlockData,
  ImageBlockData,
  ImageGalleryBlockData,
  ButtonBlockData,
  SpacerBlockData,
  DividerBlockData,
  LayoutBlockData,
  FooterBlockData,
  VideoBlockData,
  SocialIconsBlockData,
} from '../types/email'

// ============================================================================
// Block Type Guards
// ============================================================================

export function isHeadingBlock(block: EmailBlock): block is EmailBlock & { data: HeadingBlockData } {
  return block.type === 'heading'
}

export function isTextBlock(block: EmailBlock): block is EmailBlock & { data: TextBlockData } {
  return block.type === 'text'
}

export function isImageBlock(block: EmailBlock): block is EmailBlock & { data: ImageBlockData } {
  return block.type === 'image'
}

export function isImageGalleryBlock(block: EmailBlock): block is EmailBlock & { data: ImageGalleryBlockData } {
  return block.type === 'imageGallery'
}

export function isButtonBlock(block: EmailBlock): block is EmailBlock & { data: ButtonBlockData } {
  return block.type === 'button'
}

export function isSpacerBlock(block: EmailBlock): block is EmailBlock & { data: SpacerBlockData } {
  return block.type === 'spacer'
}

export function isDividerBlock(block: EmailBlock): block is EmailBlock & { data: DividerBlockData } {
  return block.type === 'divider'
}

export function isLayoutBlock(block: EmailBlock): block is EmailBlock & { data: LayoutBlockData } {
  return block.type === 'layout'
}

export function isFooterBlock(block: EmailBlock): block is EmailBlock & { data: FooterBlockData } {
  return block.type === 'footer'
}

export function isVideoBlock(block: EmailBlock): block is EmailBlock & { data: VideoBlockData } {
  return block.type === 'video'
}

export function isSocialIconsBlock(block: EmailBlock): block is EmailBlock & { data: SocialIconsBlockData } {
  return block.type === 'socialIcons'
}

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Checks if a block has mobile font size override capability
 */
export function hasMobileFontSize(block: EmailBlock): boolean {
  return isHeadingBlock(block) || isTextBlock(block)
}

/**
 * Checks if a block supports text content
 */
export function hasTextContent(block: EmailBlock): boolean {
  return isHeadingBlock(block) || isTextBlock(block) || isButtonBlock(block)
}

/**
 * Checks if a block has color property
 */
export function hasColorProperty(block: EmailBlock): boolean {
  return isHeadingBlock(block) || isTextBlock(block) || isDividerBlock(block) || isButtonBlock(block)
}

/**
 * Checks if a block has font family property
 */
export function hasFontFamily(block: EmailBlock): boolean {
  return isHeadingBlock(block) || isTextBlock(block)
}

/**
 * Gets the color value from a block if it has one
 */
export function getBlockColor(block: EmailBlock): string | undefined {
  if (isHeadingBlock(block) || isTextBlock(block)) {
    return block.data.color
  }
  if (isButtonBlock(block)) {
    return block.data.backgroundColor
  }
  if (isDividerBlock(block)) {
    return block.data.color
  }
  return undefined
}

/**
 * Gets the font size from a block if it has one
 */
export function getBlockFontSize(block: EmailBlock): string | undefined {
  if (isHeadingBlock(block) || isTextBlock(block)) {
    return block.data.fontSize
  }
  return undefined
}

/**
 * Gets the font family from a block if it has one
 */
export function getBlockFontFamily(block: EmailBlock): string | undefined {
  if (isHeadingBlock(block) || isTextBlock(block)) {
    return block.data.fontFamily
  }
  return undefined
}
