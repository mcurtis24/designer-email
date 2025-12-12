/**
 * Email Data Model
 * Based on email-editor-design-proposal.md specifications
 */

// ============================================================================
// Spacing and Style Types
// ============================================================================

export interface SpacingValue {
  top: string
  right: string
  bottom: string
  left: string
}

export interface CommonStyles {
  padding?: SpacingValue
  margin?: SpacingValue
  backgroundColor?: string
  textAlign?: 'left' | 'center' | 'right'
}

// ============================================================================
// Block Data Types
// ============================================================================

export interface HeadingBlockData {
  level: 1 | 2 | 3
  text: string
  fontFamily: string
  fontSize: string
  fontWeight: number
  color: string
  lineHeight: number
  letterSpacing?: string
}

export interface TextBlockData {
  content: string // HTML string (bold, italic, links allowed)
  fontFamily: string
  fontSize: string
  color: string
  lineHeight: number
}

export interface ImageBlockData {
  src: string // Cloudinary URL
  alt: string
  width?: number
  linkUrl?: string
  alignment: 'left' | 'center' | 'right'
  borderRadius?: number
}

export interface ImageGalleryBlockData {
  layout: '2-col' | '3-col' | '4-col'
  images: Array<{
    src: string
    alt: string
    linkUrl?: string
    borderRadius?: number
    objectPosition?: string // CSS object-position for image focal point (e.g., "50% 50%")
  }>
  gap: number // spacing between images
}

export interface ButtonBlockData {
  text: string
  linkUrl: string
  backgroundColor: string
  textColor: string
  borderRadius: number
  padding: SpacingValue
  alignment: 'left' | 'center' | 'right'
  width?: number
}

export interface SpacerBlockData {
  height: number // px
}

export interface DividerBlockData {
  color: string
  thickness: number // px
  style: 'solid' | 'dashed' | 'dotted'
  width?: string // e.g., '100%', '50%', '300px'
  padding?: string // e.g., '16px 0'
}

export interface LayoutBlockData {
  columns: 1 | 2
  columnRatio?: '1-1' | '1-2' | '2-1' // '1-1' = 50/50, '1-2' = 33/66, '2-1' = 66/33
  children: EmailBlock[]
  gap: number
}

// ============================================================================
// Block Types
// ============================================================================

export type BlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'imageGallery'
  | 'button'
  | 'spacer'
  | 'divider'
  | 'layout'

export type BlockData =
  | HeadingBlockData
  | TextBlockData
  | ImageBlockData
  | ImageGalleryBlockData
  | ButtonBlockData
  | SpacerBlockData
  | DividerBlockData
  | LayoutBlockData

// ============================================================================
// Email Block
// ============================================================================

export interface EmailBlock {
  id: string // unique ID for this block instance
  type: BlockType
  order: number // position in email
  parentId?: string // for nested blocks (inside layout blocks)
  data: BlockData
  styles: CommonStyles
}

// ============================================================================
// Color Theme Types
// ============================================================================

export interface BrandColors {
  colors: string[] // Array of hex color codes
}

export interface ColorTheme {
  documentColors: string[] // Auto-extracted from blocks
  brandColors: string[] // User-defined brand palette
}

// ============================================================================
// Email Document
// ============================================================================

export interface EmailMetadata {
  subject?: string
  preheader?: string
  fromName?: string
  fromEmail?: string
  replyTo?: string
}

export interface EmailSettings {
  backgroundColor: string
  contentWidth: number // 640px default
  fontFamily: string
  textColor: string
  brandColors: string[] // Brand kit colors
}

export interface EmailVersion {
  id: string
  timestamp: Date
  blocks: EmailBlock[]
  message?: string // optional save message
  type: 'auto' | 'manual' | 'checkpoint'
}

export interface EmailDocument {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  version: number
  metadata: EmailMetadata
  settings: EmailSettings
  blocks: EmailBlock[]
  history: EmailVersion[]
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ViewportState {
  mode: 'mobile' | 'desktop' | 'tablet'
  zoom: number // percentage (100 = 100%)
}

export interface EditorState {
  selectedBlockId: string | null
  editingBlockId: string | null // NEW: Track which block is being edited
  editingType: 'text' | 'heading' | null // NEW: What type is being edited
  draggedBlockId: string | null
  selectedGalleryImageIndex: number // Index of selected image in gallery for position controls
  viewport: ViewportState
  isDirty: boolean // has unsaved changes
  isSaving: boolean
  lastSaved: Date | null
}

// ============================================================================
// Helper Types
// ============================================================================

// Type guard helpers
export function isHeadingBlock(block: EmailBlock): block is EmailBlock & { data: HeadingBlockData } {
  return block.type === 'heading'
}

export function isTextBlock(block: EmailBlock): block is EmailBlock & { data: TextBlockData } {
  return block.type === 'text'
}

export function isImageBlock(block: EmailBlock): block is EmailBlock & { data: ImageBlockData } {
  return block.type === 'image'
}

export function isButtonBlock(block: EmailBlock): block is EmailBlock & { data: ButtonBlockData } {
  return block.type === 'button'
}

export function isLayoutBlock(block: EmailBlock): block is EmailBlock & { data: LayoutBlockData } {
  return block.type === 'layout'
}

// ============================================================================
// Default Values
// ============================================================================

export const defaultSpacing: SpacingValue = {
  top: '10px',
  right: '10px',
  bottom: '10px',
  left: '10px',
}

export const defaultEmailSettings: EmailSettings = {
  backgroundColor: '#f4f4f4',
  contentWidth: 640,
  fontFamily: 'Arial, Helvetica, sans-serif',
  textColor: '#333333',
  brandColors: [], // Empty by default, user can add brand colors
}

export const defaultViewport: ViewportState = {
  mode: 'mobile', // Mobile-first!
  zoom: 100,
}
