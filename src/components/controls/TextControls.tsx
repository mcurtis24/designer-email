/**
 * Text Block Controls
 * Properties specific to text blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, TextBlockData } from '@/types/email'
import { extractDocumentColors } from '@/lib/colorUtils'
import { BaseTypographyControls } from '@/components/controls/shared/BaseTypographyControls'

interface TextControlsProps {
  block: EmailBlock & { data: TextBlockData }
}

export default function TextControls({ block }: TextControlsProps) {
  const blocks = useEmailStore((state) => state.email.blocks)

  // Extract document colors from all blocks (shared via prop to avoid duplicate computation)
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  return (
    <BaseTypographyControls
      block={block}
      typographyPresetName="body"
      typographyPresetLabel="Body Style"
      fontSizeMin={10}
      fontSizeMax={48}
      documentColors={documentColors}
    />
  )
}
