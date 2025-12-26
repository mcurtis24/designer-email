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
  // Mobile-specific overrides
  mobileStyles?: {
    padding?: SpacingValue
    textAlign?: 'left' | 'center' | 'right'
    backgroundColor?: string
  }
  // Visibility controls
  hideOnMobile?: boolean // Hide this block on mobile devices
  hideOnDesktop?: boolean // Hide this block on desktop devices
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
  // Mobile-specific overrides
  mobileFontSize?: string
  mobileLineHeight?: number
}

export interface TextBlockData {
  content: string // HTML string (bold, italic, links allowed)
  fontFamily: string
  fontSize: string
  color: string
  lineHeight: number
  // Mobile-specific overrides
  mobileFontSize?: string
  mobileLineHeight?: number
}

export interface ImageBlockData {
  src: string // Cloudinary URL
  alt: string
  width?: number
  linkUrl?: string
  alignment: 'left' | 'center' | 'right'
  borderRadius?: number
}

export type GalleryImage = {
  src: string
  alt: string
  linkUrl?: string
  borderRadius?: number
  objectPosition?: string // CSS object-position for image focal point (e.g., "50% 50%")
}

export interface ImageGalleryBlockData {
  layout: '2-col' | '3-col' | '4-col'
  images: Array<GalleryImage>
  gap: number // spacing between images
  stackOnMobile?: boolean // Whether columns should stack vertically on mobile (default: true)
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
  columns: 1 | 2 | 3 | 4
  columnRatio?: '1-1' | '1-2' | '2-1' | '1-1-1' | '1-1-1-1' // '1-1' = 50/50, '1-2' = 33/66, '2-1' = 66/33, '1-1-1' = 33/33/33, '1-1-1-1' = 25/25/25/25
  children: EmailBlock[]
  gap: number
  stackOnMobile?: boolean // Whether columns should stack vertically on mobile (default: true)
  reverseStackOnMobile?: boolean // Reverse column order when stacking on mobile (default: false)
}

export interface FooterBlockData {
  // Company info section
  companyName: string
  address: string

  // Social media links (4 max for common layout)
  socialLinks: Array<{
    platform: 'facebook' | 'x' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'custom'
    url: string
    iconUrl?: string // For custom platform
  }>

  // Footer links
  links: Array<{
    text: string
    url: string
  }>

  // Legal text
  legalText: string

  // Styling options
  backgroundColor?: string
  textColor?: string
  linkColor?: string
  fontSize?: string
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
  | 'footer'

export type BlockData =
  | HeadingBlockData
  | TextBlockData
  | ImageBlockData
  | ImageGalleryBlockData
  | ButtonBlockData
  | SpacerBlockData
  | DividerBlockData
  | LayoutBlockData
  | FooterBlockData

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

export interface BrandColor {
  color: string // Hex color code
  name?: string // Optional user-defined name
  order: number // Display order
}

export interface TypographyStyle {
  name: 'heading' | 'body' // Style type
  fontFamily: string
  fontSize: string // Desktop font size (e.g., "24px")
  mobileFontSize?: string // Optional mobile override
  fontWeight: number // 400 (normal), 700 (bold), etc.
  color: string // Text color
  lineHeight: number // Line height multiplier (e.g., 1.5)
}

export interface SavedComponent {
  id: string // Unique ID for the saved component
  name: string // User-defined name (e.g., "Newsletter Header", "CTA Button")
  block: EmailBlock // The complete block including data and styles
  thumbnail?: string // Optional base64 thumbnail image
  createdAt: Date
  category?: string // Optional category (e.g., "Headers", "CTAs", "Footers")
}

export type TemplateCategory =
  | 'newsletter'
  | 'promotion'
  | 'announcement'
  | 'transactional'
  | 'event'
  | 'update'
  | 'welcome'
  | 'other'

export type TemplateSource = 'system' | 'user' | 'imported'

export interface UserTemplate {
  id: string // Unique template ID
  name: string // User-defined template name
  description?: string // Optional description
  category: TemplateCategory // Template category for filtering
  tags: string[] // Searchable tags

  // Email content
  blocks: EmailBlock[] // Full email blocks
  settings: EmailSettings // Email-level settings (background, width, etc.)

  // Visual preview
  thumbnail: string // Base64 PNG image (auto-generated)
  thumbnailGeneratedAt: Date

  // Metadata
  createdAt: Date
  updatedAt: Date
  lastUsedAt?: Date // Last time template was loaded
  useCount: number // Number of times template was used

  // Source tracking
  source: TemplateSource // 'user' for user-created templates
  version: number // Template version for future migrations
}

export interface EmailSettings {
  backgroundColor: string
  contentWidth: number // 640px default
  fontFamily: string
  textColor: string
  brandColors: BrandColor[] // Brand kit colors with names
  typographyStyles?: TypographyStyle[] // Typography presets
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

export function isGalleryBlock(block: EmailBlock): block is EmailBlock & { data: ImageGalleryBlockData } {
  return block.type === 'imageGallery'
}

export function isFooterBlock(block: EmailBlock): block is EmailBlock & { data: FooterBlockData } {
  return block.type === 'footer'
}

export function isSpacerBlock(block: EmailBlock): block is EmailBlock & { data: SpacerBlockData } {
  return block.type === 'spacer'
}

export function isDividerBlock(block: EmailBlock): block is EmailBlock & { data: DividerBlockData } {
  return block.type === 'divider'
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
  typographyStyles: [
    {
      name: 'heading',
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      mobileFontSize: '24px',
      fontWeight: 700,
      color: '#1F2937',
      lineHeight: 1.2,
    },
    {
      name: 'body',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '16px',
      fontWeight: 400,
      color: '#374151',
      lineHeight: 1.6,
    },
  ],
}

export const defaultViewport: ViewportState = {
  mode: 'mobile', // Mobile-first!
  zoom: 100,
}
