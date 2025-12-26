/**
 * Block Default Values
 * Factory functions to create new blocks with sensible defaults
 */

import { nanoid } from 'nanoid'
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
  BlockType,
} from '@/types/email'
import { defaultSpacing } from '@/types/email'

export function createHeadingBlock(order: number): EmailBlock {
  const data: HeadingBlockData = {
    level: 1,
    text: '',
    fontFamily: 'Georgia, serif',
    fontSize: '48px',
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  }

  return {
    id: nanoid(),
    type: 'heading',
    order,
    data,
    styles: {
      padding: { top: '8px', right: '8px', bottom: '8px', left: '8px' },
      textAlign: 'center',
    },
  }
}

export function createTextBlock(order: number): EmailBlock {
  const data: TextBlockData = {
    content: '',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '16px',
    color: '#4B5563',
    lineHeight: 1.6,
  }

  return {
    id: nanoid(),
    type: 'text',
    order,
    data,
    styles: {
      padding: { top: '8px', right: '8px', bottom: '8px', left: '8px' },
      textAlign: 'left',
    },
  }
}

export function createImageBlock(order: number): EmailBlock {
  const data: ImageBlockData = {
    src: '',
    alt: 'Image',
    width: 640,
    alignment: 'center',
    borderRadius: 0,
  }

  return {
    id: nanoid(),
    type: 'image',
    order,
    data,
    styles: {
      padding: { ...defaultSpacing },
    },
  }
}

export function createGalleryBlock(order: number): EmailBlock {
  const data: ImageGalleryBlockData = {
    layout: '2-col',
    images: [
      { src: '', alt: 'Gallery image 1', borderRadius: 0 },
      { src: '', alt: 'Gallery image 2', borderRadius: 0 },
    ],
    gap: 8,
    stackOnMobile: true,
  }

  return {
    id: nanoid(),
    type: 'imageGallery',
    order,
    data,
    styles: {
      padding: { ...defaultSpacing },
    },
  }
}

export function createButtonBlock(order: number): EmailBlock {
  const data: ButtonBlockData = {
    text: 'Click Here',
    linkUrl: 'https://example.com',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    borderRadius: 8,
    padding: {
      top: '16px',
      right: '32px',
      bottom: '16px',
      left: '32px',
    },
    alignment: 'center',
    width: undefined,
  }

  return {
    id: nanoid(),
    type: 'button',
    order,
    data,
    styles: {
      padding: { ...defaultSpacing },
    },
  }
}

export function createSpacerBlock(order: number): EmailBlock {
  const data: SpacerBlockData = {
    height: 40,
  }

  return {
    id: nanoid(),
    type: 'spacer',
    order,
    data,
    styles: {},
  }
}

export function createDividerBlock(order: number): EmailBlock {
  const data: DividerBlockData = {
    color: '#e5e7eb',
    thickness: 1,
    style: 'solid',
    width: '100%',
    padding: '16px 0',
  }

  return {
    id: nanoid(),
    type: 'divider',
    order,
    data,
    styles: {},
  }
}

export function createLayoutBlock(order: number): EmailBlock {
  const data: LayoutBlockData = {
    columns: 2,
    children: [],
    gap: 24,
    stackOnMobile: true,
  }

  return {
    id: nanoid(),
    type: 'layout',
    order,
    data,
    styles: {
      padding: { ...defaultSpacing },
    },
  }
}

export function createFooterBlock(order: number): EmailBlock {
  const data: FooterBlockData = {
    companyName: '',
    address: '',
    socialLinks: [],
    links: [
      { text: 'Unsubscribe', url: '{{unsubscribe_url}}' },
      { text: 'Privacy Policy', url: 'https://example.com/privacy' },
    ],
    legalText: '© 2025 Your Company. All rights reserved.',
    backgroundColor: '#F3F4F6',
    textColor: '#6B7280',
    linkColor: '#3B82F6',
    fontSize: '14px',
  }

  return {
    id: nanoid(),
    type: 'footer',
    order,
    data,
    styles: {
      padding: { top: '40px', right: '20px', bottom: '40px', left: '20px' },
    },
  }
}

// Factory function to create any block type
export function createBlock(type: BlockType, order: number): EmailBlock {
  switch (type) {
    case 'heading':
      return createHeadingBlock(order)
    case 'text':
      return createTextBlock(order)
    case 'image':
      return createImageBlock(order)
    case 'imageGallery':
      return createGalleryBlock(order)
    case 'button':
      return createButtonBlock(order)
    case 'spacer':
      return createSpacerBlock(order)
    case 'divider':
      return createDividerBlock(order)
    case 'layout':
      return createLayoutBlock(order)
    case 'footer':
      return createFooterBlock(order)
    default:
      // Default to text block if unknown type
      return createTextBlock(order)
  }
}
