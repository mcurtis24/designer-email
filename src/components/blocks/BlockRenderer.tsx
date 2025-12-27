import type { EmailBlock } from '@/types/email'
import {
  isHeadingBlock,
  isTextBlock,
  isImageBlock,
  isImageGalleryBlock,
  isButtonBlock,
  isSpacerBlock,
  isDividerBlock,
  isLayoutBlock,
  isFooterBlock,
} from '@/lib/typeGuards'
import HeadingBlock from './HeadingBlock'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import GalleryBlock from './GalleryBlock'
import ButtonBlock from './ButtonBlock'
import SpacerBlock from './SpacerBlock'
import DividerBlock from './DividerBlock'
import LayoutBlock from './LayoutBlock'
import FooterBlock from './FooterBlock'

interface BlockRendererProps {
  block: EmailBlock
  isSelected?: boolean
  onClick?: () => void
  onFormatRequest?: (handler: (command: string, value?: string) => void) => void
  onActiveStatesChange?: (states: { isBold: boolean; isItalic: boolean; isUnderline: boolean }) => void
}

export default function BlockRenderer({ block, isSelected = false, onClick, onFormatRequest, onActiveStatesChange }: BlockRendererProps) {
  const defaultClickHandler = () => {}
  const clickHandler = onClick || defaultClickHandler

  switch (block.type) {
    case 'heading':
      if (isHeadingBlock(block)) {
        return <HeadingBlock block={block} isSelected={isSelected} onClick={clickHandler} onFormatRequest={onFormatRequest} onActiveStatesChange={onActiveStatesChange} />
      }
      break
    case 'text':
      if (isTextBlock(block)) {
        return <TextBlock block={block} isSelected={isSelected} onClick={clickHandler} onFormatRequest={onFormatRequest} onActiveStatesChange={onActiveStatesChange} />
      }
      break
    case 'image':
      if (isImageBlock(block)) {
        return <ImageBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    case 'imageGallery':
      if (isImageGalleryBlock(block)) {
        return <GalleryBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    case 'button':
      if (isButtonBlock(block)) {
        return <ButtonBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    case 'spacer':
      if (isSpacerBlock(block)) {
        return <SpacerBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    case 'divider':
      if (isDividerBlock(block)) {
        return <DividerBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    case 'layout':
      if (isLayoutBlock(block)) {
        return <LayoutBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    case 'footer':
      if (isFooterBlock(block)) {
        return <FooterBlock block={block} isSelected={isSelected} onClick={clickHandler} />
      }
      break
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Unknown block type: {block.type}</p>
        </div>
      )
  }
}
