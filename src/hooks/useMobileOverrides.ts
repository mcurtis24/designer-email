/**
 * Mobile Overrides Hook
 * Shared logic for handling mobile overrides across typography controls
 */

import type { EmailBlock, TextBlockData, HeadingBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'

type TypographyBlockData = TextBlockData | HeadingBlockData

export function useMobileOverrides<T extends TypographyBlockData>(
  block: EmailBlock & { data: T }
) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const data = block.data

  // Check if mobile overrides exist
  const hasMobileFontSize = !!data.mobileFontSize
  const hasMobileLineHeight = !!data.mobileLineHeight
  const hasMobileBackgroundColor = !!block.styles.mobileStyles?.backgroundColor

  const clearMobileFontSize = () => {
    updateBlock(block.id, {
      data: {
        ...data,
        mobileFontSize: undefined,
      },
    })
  }

  const clearMobileLineHeight = () => {
    updateBlock(block.id, {
      data: {
        ...data,
        mobileLineHeight: undefined,
      },
    })
  }

  const clearMobileBackgroundColor = () => {
    const { mobileStyles, ...otherStyles } = block.styles
    const { backgroundColor, ...otherMobileStyles } = mobileStyles || {}

    updateBlock(block.id, {
      styles: {
        ...otherStyles,
        ...(Object.keys(otherMobileStyles).length > 0 ? { mobileStyles: otherMobileStyles } : {}),
      },
    })
  }

  const handleBackgroundChange = (color: string, isMobile: boolean) => {
    if (isMobile) {
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          mobileStyles: {
            ...block.styles.mobileStyles,
            backgroundColor: color,
          },
        },
      })
    } else {
      updateBlock(block.id, {
        styles: {
          ...block.styles,
          backgroundColor: color,
        },
      })
    }
  }

  return {
    hasMobileFontSize,
    hasMobileLineHeight,
    hasMobileBackgroundColor,
    clearMobileFontSize,
    clearMobileLineHeight,
    clearMobileBackgroundColor,
    handleBackgroundChange,
  }
}
