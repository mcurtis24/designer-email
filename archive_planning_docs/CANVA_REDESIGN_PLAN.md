# Canva-Inspired UI Redesign Plan
## Email Designer - Modern, Elegant Interface

> **Goal**: Transform the current email designer to closely resemble Canva's modern, elegant design while maintaining email-safe output. The email templates should look and feel like modern websites, not traditional emails.

---

## 1. Top Canvas Toolbar (Context-Sensitive Rich Text Editor)

### Current State
- Rich text toolbar floats above text/heading when editing
- Positioned using `transform: translateY(-100%)`
- Appears inside the block's container

### Canva Design
- Toolbar is fixed at the top of the canvas area
- Only appears when text/heading is being edited
- Clean, horizontal layout with icon buttons
- Includes: Magic Write, H1/H2/H3, Font, Size, Bold, Italic, Underline, Color, Lists, Alignment

### Proposed Changes

#### A. Create New `CanvasToolbar` Component
**Location**: `src/components/layout/CanvasToolbar.tsx`

**Features**:
- Fixed position at top of canvas (below main nav, above email canvas)
- Only visible when `isEditingText` or `isEditingHeading` state is true
- Smooth slide-down animation when appearing
- Grouped button sections with subtle dividers
- Modern icon buttons with hover states

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [H1] [H2] [H3] │ [Georgia ▼] [28 ▼] │ [B] [I] [U] [S] │ ...  │
└─────────────────────────────────────────────────────────────────┘
```

**Button Groups**:
1. **Heading Levels**: H1, H2, H3 (only for headings)
2. **Typography**: Font family dropdown, Font size dropdown
3. **Formatting**: Bold, Italic, Underline, Strikethrough
4. **Color**: Text color picker with recent colors
5. **Lists**: Bullet list, Numbered list
6. **Alignment**: Left, Center, Right, Justify
7. **Links**: Insert/Edit link
8. **More**: Additional options dropdown

#### B. Update Text/Heading Block Editing
- Remove floating inline toolbar
- On focus/click → show `CanvasToolbar` at top
- On blur (click outside) → hide `CanvasToolbar`
- Store `editingBlockId` in global state to track which block is being edited

#### C. Styling
```css
- Background: White with subtle shadow
- Height: 52px
- Padding: 8px 16px
- Border-bottom: 1px solid #e5e7eb
- Buttons: 36px × 36px, rounded-md, hover:bg-gray-100
- Icon size: 18px
- Font controls: Dropdowns with clean styling
```

---

## 2. Modern Block Library Redesign

### Current State
- Simple draggable list in right sidebar
- Text labels with small icons
- Grouped by category (TEXT, MEDIA, LAYOUT)
- Minimal visual appeal

### Canva Design
- Left sidebar with visual category cards
- Colorful gradient backgrounds
- Large icons/previews
- "Browse categories" section with grid layout
- Search functionality
- Recently used section

### Proposed Changes

#### A. New Block Library Structure
**Location**: `src/components/layout/BlockLibrary.tsx`

**Sections**:
1. **Search Bar** - "Search elements" at top
2. **Recently Used** - Horizontal scroll of last 4-6 used blocks
3. **Quick Add** - Common shapes/elements (Rectangle, Circle, Line, etc.)
4. **Browse Categories** - Visual grid cards

#### B. Category Cards
Each category gets a visual card with:
- Gradient background (brand-aligned colors)
- Large icon or preview
- Category name
- Count badge (optional)

**Categories**:
```
┌─────────────┬─────────────┬─────────────┐
│   Headers   │   Footers   │   Buttons   │
│   [purple]  │   [pink]    │   [teal]    │
└─────────────┴─────────────┴─────────────┘
┌─────────────┬─────────────┬─────────────┐
│   Columns   │   Images    │   Videos    │
│   [green]   │   [blue]    │   [orange]  │
└─────────────┴─────────────┴─────────────┘
```

**Color Palette** (Elegant, not cartoony):
- Headers: Purple gradient (#8B5CF6 → #7C3AED)
- Footers: Pink gradient (#EC4899 → #DB2777)
- Buttons: Teal gradient (#14B8A6 → #0D9488)
- Columns: Green gradient (#10B981 → #059669)
- Images: Blue gradient (#3B82F6 → #2563EB)
- Text: Indigo gradient (#6366F1 → #4F46E5)
- Dividers: Gray gradient (#6B7280 → #4B5563)
- Spacers: Amber gradient (#F59E0B → #D97706)

#### C. Visual Block Previews
- Show miniature preview of what the block looks like
- For text: Show "Aa" with styling
- For images: Show image placeholder icon
- For buttons: Show mini button preview
- For layouts: Show column structure diagram

---

## 3. Modern Block Rendering (Website-Like Design)

### Current State
- Basic, utilitarian block rendering
- Traditional email styling
- Minimal visual polish

### Canva Design Goal
- Blocks look like modern website components
- High-quality typography
- Better spacing and padding
- Subtle shadows and depth
- Professional photography
- Clean, elegant aesthetic

### Proposed Changes

#### A. Typography Improvements

**Heading Defaults**:
```typescript
H1: {
  fontSize: '48px',
  fontWeight: 700,
  lineHeight: 1.2,
  fontFamily: 'Georgia, serif', // Elegant serif
  color: '#111827',
  letterSpacing: '-0.02em'
}

H2: {
  fontSize: '36px',
  fontWeight: 600,
  lineHeight: 1.3,
  fontFamily: 'Georgia, serif',
  color: '#1F2937',
  letterSpacing: '-0.01em'
}

H3: {
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontFamily: 'Georgia, serif',
  color: '#374151',
}
```

**Body Text Defaults**:
```typescript
Text: {
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.6,
  fontFamily: 'Inter, system-ui, sans-serif',
  color: '#4B5563',
  maxWidth: '600px' // Optimal reading width
}
```

#### B. Button Component Redesign

**Current**: Basic button with border radius
**New**: Modern, website-style CTA buttons

**Styles**:
- Larger padding: 16px 32px
- Border radius: 8px (softer corners)
- Font weight: 600
- Letter spacing: 0.02em
- Subtle shadow: 0 2px 8px rgba(0,0,0,0.1)
- Hover states (in preview only)
- Default: Solid colored background
- Secondary: Outlined button option
- Sizes: Small, Medium, Large

**Default Colors**:
- Primary: #10B981 (Green - "GET INVOLVED" style)
- Secondary: #3B82F6 (Blue)
- Dark: #111827 (Almost black)
- Light: #F3F4F6 (Light gray)

#### C. Image Block Enhancements

**Features**:
- Support for high-quality images (Cloudinary optimization)
- Subtle rounded corners (8px default)
- Optional subtle shadow
- Better aspect ratio handling
- Cover/contain options
- Lazy loading indicators

#### D. Spacing & Layout

**Default Padding**:
- Sections: 48px vertical, 24px horizontal
- Headings: 24px bottom margin
- Paragraphs: 16px bottom margin
- Buttons: 32px top margin
- Images: 24px vertical margin

**Container Widths**:
- Text content: max 600px for readability
- Full-width images: 640px
- Centered layout with auto margins

---

## 4. Color & Design System

### Color Palette (Elegant, Professional)

**Primary Colors**:
```typescript
const colors = {
  // Main brand colors
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#10B981', // Main green
    600: '#059669',
    700: '#047857',
  },

  // Text colors
  text: {
    primary: '#111827',    // Headings
    secondary: '#374151',  // Subheadings
    body: '#4B5563',       // Body text
    muted: '#6B7280',      // Muted text
  },

  // Background colors
  bg: {
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
    }
  },

  // Category colors (for block library)
  categories: {
    headers: ['#8B5CF6', '#7C3AED'],
    footers: ['#EC4899', '#DB2777'],
    buttons: ['#14B8A6', '#0D9488'],
    columns: ['#10B981', '#059669'],
    images: ['#3B82F6', '#2563EB'],
    text: ['#6366F1', '#4F46E5'],
  }
}
```

### Typography System

**Font Families**:
```typescript
const fonts = {
  // Serif - for elegant headings
  serif: 'Georgia, "Times New Roman", serif',

  // Sans-serif - for body text
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Monospace - for code/technical
  mono: '"Courier New", Courier, monospace',
}
```

**Font Weights**:
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 5. Canvas Area Improvements

### Current State
- Basic white canvas with zoom controls
- Minimal chrome around email
- Simple viewport toggle

### Proposed Enhancements

#### A. Canvas Container
- Add subtle page shadow to make email "float" on canvas
- Better zoom controls (Canva-style slider at bottom)
- Page indicator (1/1 style)
- Background color: Light gray (#F3F4F6) for contrast

#### B. Contextual Toolbar (Top of Canvas)
- Shows when text/heading is being edited
- Replaces floating inline toolbar
- Smooth slide-down animation
- Clean, modern button styling

#### C. Quick Actions (Bottom Bar)
```
┌────────────────────────────────────────────────┐
│ [Notes] [Outline] [Timer] ... [100% ▼] [1/1]  │
└────────────────────────────────────────────────┘
```

Optional features:
- Notes panel
- Outline view
- Zoom slider with percentage
- Page navigator
- View modes

---

## 6. Block Interactions & Polish

### A. Hover States
- Subtle elevation on hover
- Show mini toolbar on hover (move, duplicate, delete icons)
- Smooth transitions (150ms ease-out)

### B. Selection States
- Blue ring (current) → softer, thicker border
- Corner resize handles (for images)
- Drag handles more prominent

### C. Drag & Drop
- Smooth animations
- Ghost preview while dragging
- Clear drop zones with highlight
- Snap to grid option

### D. Empty States
**Better placeholder designs**:
- Text: "Click to add text" with elegant typography preview
- Image: Beautiful icon with "Add image" text
- Button: "Add button" with preview of button style

---

## 7. Implementation Phases

### Phase 1: Foundation ✅ COMPLETE
**Priority: High**
- [x] Create `CanvasToolbar` component (top toolbar)
- [x] Move rich text editing to top toolbar
- [x] Update editing state management (track `editingBlockId`)
- [x] Remove floating inline toolbars from TextBlock/HeadingBlock
- [x] Add Font Family dropdown showing current font
- [x] Add Font Size controls (- / + buttons with numeric input)
- [x] Add Text Color button that opens Style sidebar
- [x] Add fontSize command handler to text/heading blocks
- [x] Remove redundant Font Family/Size from Style sidebar
- [x] Fix italic icon to proper slanted "I"
- [x] Move viewport/zoom/clear to bottom toolbar
- [x] Reposition canvas toolbar to flow above canvas
- [x] Fix text selection - cursor no longer jumps to first position
- [x] Fix bold/italic/underline buttons with selection preservation
- [x] Add debouncing for selection change events
- [x] Exit editing mode when different block selected
- [x] Fix sidebar reactive subscriptions (DesignControls)
- [x] Individual character/word styling works correctly

**Deliverables**: ✅
- Top toolbar appears when editing text/heading
- Clean, modern button styling matching Canva
- Smooth show/hide animations
- Full font and size control in toolbar
- Text color workflow matches Canva (button → sidebar)
- Cleaner sidebar without redundant controls
- All toolbar buttons fully functional
- Text selection and formatting work perfectly
- Sidebar updates immediately when switching blocks
- Professional layout with bottom controls toolbar

---

### Phase 2: Block Library Redesign (Week 1-2)
**Priority: High**
- [ ] Redesign `BlockLibrary` component
- [ ] Add search functionality
- [ ] Create visual category cards with gradients
- [ ] Add "Recently Used" section
- [ ] Create category icons/previews

**Deliverables**:
- Canva-style visual block library
- Color-coded categories
- Search and filtering
- Recently used tracking

---

### Phase 3: Typography & Styling (Week 2)
**Priority: Medium**
- [ ] Update default font families (Georgia for headings, Inter for body)
- [ ] Improve heading sizes and weights
- [ ] Better line heights and spacing
- [ ] Letter spacing for headings
- [ ] Update text color palette

**Deliverables**:
- Website-quality typography
- Better readability
- Professional text rendering

---

### Phase 4: Modern Block Components ✅ COMPLETE
**Priority: Medium**
- [x] Redesign ButtonBlock (bigger, softer, shadows)
- [x] Update ImageBlock (rounded corners, better aspect ratios)
- [x] Improve SpacerBlock controls
- [x] Add DividerBlock styling options
- [x] Update LayoutBlock (better column gaps and alignment)

**Deliverables**: ✅
- Modern, website-like components
- Better default styling (16px 32px padding, 8px border radius)
- More visual options
- Subtle shadows and depth
- Improved hover states and interactivity

---

### Phase 5: Canvas & Polish ✅ COMPLETE
**Priority: Low**
- [x] Canvas background and shadows
- [x] Bottom toolbar with zoom slider (already implemented in Phase 1)
- [ ] Page indicator (not needed - single page emails)
- [x] Better hover states
- [x] Smooth transitions
- [x] Corner resize handles for images (visual indicators added)

**Deliverables**: ✅
- Polished canvas experience
- Better visual hierarchy
- Smooth interactions
- Email "floats" with elegant shadow
- Improved block hover states
- 150ms transitions throughout

---

### Phase 6: Advanced Features (Week 4+)
**Priority: Optional**
- [ ] Templates gallery (Canva-style)
- [ ] Magic Write AI integration
- [ ] Gradient backgrounds for sections
- [ ] Image filters and adjustments
- [ ] Animation previews
- [ ] Collaboration features

---

## 8. Design Specifications

### Component Sizing
```typescript
const sizing = {
  toolbar: {
    height: '52px',
    buttonSize: '36px',
    iconSize: '18px',
    gap: '8px',
  },

  sidebar: {
    width: '280px',
    categoryCard: {
      width: '84px',
      height: '84px',
    },
  },

  canvas: {
    maxWidth: '640px',
    padding: '48px 24px',
  },

  buttons: {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' },
  },
}
```

### Border Radius
```typescript
const borderRadius = {
  sm: '4px',   // Small UI elements
  md: '8px',   // Buttons, cards
  lg: '12px',  // Modals, panels
  xl: '16px',  // Large cards
}
```

### Shadows
```typescript
const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.2)',
}
```

---

## 9. Technical Implementation Notes

### State Management
```typescript
// Add to emailStore.ts
interface EditorState {
  selectedBlockId: string | null
  editingBlockId: string | null  // NEW: Track which block is being edited
  editingType: 'text' | 'heading' | null  // NEW: What type is being edited
  draggedBlockId: string | null
  viewport: ViewportState
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
}
```

### New Components to Create
1. `CanvasToolbar.tsx` - Top editing toolbar
2. `CategoryCard.tsx` - Visual block category cards
3. `SearchBar.tsx` - Element search
4. `RecentlyUsed.tsx` - Recently used blocks
5. `BottomToolbar.tsx` - Canvas controls (zoom, pages, etc.)

### Components to Update
1. `BlockLibrary.tsx` - Complete redesign
2. `TextBlock.tsx` - Remove inline toolbar, use top toolbar
3. `HeadingBlock.tsx` - Remove inline toolbar, use top toolbar
4. `ButtonBlock.tsx` - Modern styling
5. `ImageBlock.tsx` - Rounded corners, better aspect ratios
6. `Canvas.tsx` - Add background, shadows, bottom toolbar

---

## 10. Success Criteria

### User Experience
- [ ] Rich text toolbar feels smooth and responsive
- [ ] Block library is visually appealing and easy to navigate
- [ ] Email designs look like modern websites
- [ ] Typography is professional and readable
- [ ] Interactions feel polished (hover, select, drag)

### Visual Quality
- [ ] Matches Canva's modern, elegant aesthetic
- [ ] Not cartoony - sophisticated and professional
- [ ] Good use of whitespace and spacing
- [ ] Consistent color palette
- [ ] Smooth animations and transitions

### Functional
- [ ] All existing features still work
- [ ] Email output remains email-safe (inline styles, tables)
- [ ] Performance is not degraded
- [ ] Works across all supported browsers
- [ ] Mobile responsive (for editor interface)

---

## 11. Files to Modify

### New Files
```
src/components/layout/CanvasToolbar.tsx
src/components/ui/CategoryCard.tsx
src/components/ui/SearchBar.tsx
src/components/ui/RecentlyUsed.tsx
src/components/layout/BottomToolbar.tsx
src/styles/canva-theme.css
```

### Modified Files
```
src/components/layout/BlockLibrary.tsx
src/components/layout/Canvas.tsx
src/components/blocks/TextBlock.tsx
src/components/blocks/HeadingBlock.tsx
src/components/blocks/ButtonBlock.tsx
src/components/blocks/ImageBlock.tsx
src/components/ui/RichTextToolbar.tsx (repurpose for CanvasToolbar)
src/stores/emailStore.ts
src/lib/blockDefaults.ts
```

---

## 12. Design Assets Needed

### Icons
- Category icons (headers, footers, buttons, etc.)
- Tool icons (bold, italic, underline, etc.)
- Action icons (upload, link, color, etc.)

### Images
- Placeholder images for empty states
- Example templates for gallery
- Preview thumbnails

### Fonts
- Inter (for body text) - Already available via CDN
- Georgia (for headings) - System font

---

## 13. Next Steps

1. **Review & Approve Plan** - Get user feedback on proposed changes
2. **Start Phase 1** - Implement top canvas toolbar
3. **Design Mockups** - Create visual mockups for new components (optional)
4. **Incremental Implementation** - Roll out changes phase by phase
5. **User Testing** - Get feedback after each phase
6. **Iterate & Polish** - Refine based on feedback

---

## Notes

- Keep email HTML output unchanged (table-based, inline styles)
- Maintain backwards compatibility with existing emails
- Progressive enhancement approach
- Mobile-first responsive design for editor
- Accessibility considerations (ARIA labels, keyboard navigation)
- Performance monitoring (watch bundle size)

---

**Last Updated**: 2025-12-06
**Status**: Phase 5 Complete - Canva Redesign Core Features Complete!
**Progress**: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 ✅ | Phase 5 ✅ | Phase 6 Optional
**Estimated Timeline**: Core redesign complete. Phase 6 (Advanced Features) is optional.
