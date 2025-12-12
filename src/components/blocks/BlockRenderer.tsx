import type { EmailBlock } from '@/types/email'
import HeadingBlock from './HeadingBlock'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import GalleryBlock from './GalleryBlock'
import ButtonBlock from './ButtonBlock'
import SpacerBlock from './SpacerBlock'
import DividerBlock from './DividerBlock'
import LayoutBlock from './LayoutBlock'

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
      return <HeadingBlock block={block as any} isSelected={isSelected} onClick={clickHandler} onFormatRequest={onFormatRequest} onActiveStatesChange={onActiveStatesChange} />
    case 'text':
      return <TextBlock block={block as any} isSelected={isSelected} onClick={clickHandler} onFormatRequest={onFormatRequest} onActiveStatesChange={onActiveStatesChange} />
    case 'image':
      return <ImageBlock block={block as any} isSelected={isSelected} onClick={clickHandler} />
    case 'imageGallery':
      return <GalleryBlock block={block as any} isSelected={isSelected} onClick={clickHandler} />
    case 'button':
      return <ButtonBlock block={block as any} isSelected={isSelected} onClick={clickHandler} />
    case 'spacer':
      return <SpacerBlock block={block as any} isSelected={isSelected} onClick={clickHandler} />
    case 'divider':
      return <DividerBlock block={block as any} isSelected={isSelected} onClick={clickHandler} />
    case 'layout':
      return <LayoutBlock block={block as any} isSelected={isSelected} onClick={clickHandler} />
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Unknown block type: {block.type}</p>
        </div>
      )
  }
}
