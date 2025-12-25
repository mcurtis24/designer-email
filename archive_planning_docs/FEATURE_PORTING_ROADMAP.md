# Feature Porting Roadmap: Composer Studio → Designer Email

**Date:** December 5, 2025
**Status:** Draft Recommendations
**Reviewed By:** Code-Reviewer Agent + Design-Agent

---

## Executive Summary

This document outlines features and functionality to port from the mature Composer Studio codebase (`composer-studio/v0-composer-v2`) to the new Designer Email rebuild (`designer-email`). The analysis combines technical feasibility assessment with UX/design best practices.

### Key Findings

**Current State:**
- ✅ Clean React + TypeScript + Vite architecture
- ✅ Professional UI with dark blue header
- ✅ Right sidebar with 4 tabs (Blocks, Style, Templates, Branding)
- ✅ Basic drag-and-drop with 5 block types
- ✅ Progress stepper UI
- ❌ Missing 12+ block types from old version
- ❌ No row-based multi-column layouts
- ❌ Basic text editing (no rich formatting)
- ❌ No version history or templates

**Gap Analysis:**
- **17 vs 5 block types** (12 missing)
- **Row-based layouts** (critical missing feature)
- **Advanced rich text editor** (15+ fonts, full formatting)
- **Professional HTML generation** (1,440 lines vs 249 lines)
- **AI integration** (Claude-powered features)
- **Templates and branding system**

---

## Critical Design Recommendations (Address First)

### 🚨 High Priority UX Issues

#### 1. Remove Progress Stepper (Immediate)
**Problem:** Progress stepper creates false linear workflow expectations. Email design is iterative and non-linear.

**Action:** Delete `ProgressStepper.tsx` entirely
- Replace with "Email Settings" button in top nav (modal for subject, preheader, from/to)
- Show subject line editable directly above canvas

**Rationale:** Users jump between design/test/settings in their own order. Don't force a workflow that doesn't exist.

#### 2. Fix Canvas Empty State Text (Immediate)
**Current:** "Start by dragging a block from the left sidebar"
**Problem:** Sidebar is on the RIGHT
**Fix:** Change to "Drag blocks from the right to get started →"

**File:** `/Users/home/Local Sites/designer-email/src/components/layout/Canvas.tsx:74-76`

#### 3. Change "Saved" Badge Color (Immediate)
**Current:** Orange (#ff6b35)
**Problem:** Orange signals warning, not success
**Fix:** Change to green (#10b981)

**File:** `/Users/home/Local Sites/designer-email/src/components/layout/TopNav.tsx:126-131`

#### 4. Remove Canvas Asymmetric Padding (Immediate)
**Current:** `p-6 pl-16` creates unbalanced layout
**Fix:** Change to balanced `p-6`

**File:** `/Users/home/Local Sites/designer-email/src/components/layout/Canvas.tsx:72`

---

## Feature Prioritization (Revised)

Based on both technical and UX analysis, here's the recommended implementation order:

### Phase 1: Foundation (Weeks 1-3) - CRITICAL
**Priority: Must-Have Before Launch**

1. **Row-Based Multi-Column Layout System** ⭐
   - Without this, users cannot create real email layouts
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/lib/row-helpers.ts`
   - Supports 1-4 columns per row
   - Each column is a drop zone for nested blocks
   - See detailed design spec in "Implementation Details" section

2. **Enhanced Rich Text Editor** ⭐
   - Current inline editing is too basic for production
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/rich-text-editor.tsx` (24KB)
   - Floating toolbar pattern (context-aware)
   - Full formatting: Bold, Italic, Underline, Lists, Links, Colors, Headings
   - See detailed design spec below

3. **Gallery Block** ⭐
   - Essential for e-commerce and visual storytelling
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/gallery-block.tsx`
   - Grid layout with configurable columns
   - Cloudinary integration for upload/crop
   - See detailed design spec below

4. **Divider Block**
   - Simple, high value for visual separation
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/divider-block.tsx`
   - Just a styled `<hr>` with color/thickness controls

5. **Professional HTML Generation**
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/lib/structured-email-generator.ts` (1,440 lines)
   - Table-based layouts for email client compatibility
   - Gmail/Outlook optimizations
   - Inline CSS (no external stylesheets)
   - VML fallbacks for Outlook

**Estimated Timeline:** 3 weeks
**Dependencies:** None (foundational)

---

### Phase 2: Professional Capabilities (Weeks 4-6)
**Priority: High - Needed for Production Use**

1. **Templates System** ⭐
   - Critical for onboarding and productivity
   - Modal gallery with preview
   - Categories: Newsletter, Promo, Event, Product, Welcome
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/email-templates.tsx`
   - See detailed design spec below

2. **Video Block**
   - YouTube/Vimeo embed with fallback image
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/video-block.tsx`
   - Auto-generates thumbnail from video URL

3. **Footer Block**
   - Multi-column footer with links, social, copyright
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/footer-block.tsx`
   - Dynamic column management (add/remove)

4. **Social Follow Block**
   - Social media icons with links
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/social-follow-block.tsx`
   - Icon packs: Circle, Square, Rounded

5. **Branding System**
   - Save brand colors, fonts, logos
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/branding-config.tsx`
   - Apply brand to new emails automatically
   - Modal interface (not persistent tab)

6. **Improved Image Upload**
   - Already has Cloudinary integration
   - Old version adds: Crop, resize, filters
   - File: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/cloudinary-image-upload.tsx`

**Estimated Timeline:** 3 weeks
**Dependencies:** Phase 1 (row layouts required for footer)

---

### Phase 3: Advanced Features (Weeks 7-10)
**Priority: Medium - Quality of Life Improvements**

1. **Version History with Auto-Save**
   - Slide-out panel (not modal)
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/version-history-modal.tsx`
   - Keep last 50 versions
   - Manual save with labels
   - Preview and restore capability

2. **Share Block**
   - Social sharing buttons (Facebook, Twitter, LinkedIn)
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/share-block.tsx`

3. **Code Block**
   - Custom HTML snippets
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/code-block.tsx`
   - Syntax highlighting for editing
   - Renders as raw HTML in preview

4. **Boxed Text Block**
   - Text with background color and padding
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/boxed-text-block.tsx`
   - Used for callouts and highlights

5. **Image Card Block**
   - Image with overlay text
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/image-card-block.tsx`

**Estimated Timeline:** 4 weeks
**Dependencies:** None (incremental additions)

---

### Phase 4: AI Integration (Weeks 11-14) - OPTIONAL
**Priority: Low - Differentiation Feature**

1. **AI Chat Sidebar**
   - Claude-powered email generation
   - Old version: `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/ai/ai-sidebar.tsx`
   - Requires Anthropic API key
   - Floating action button trigger
   - See AI documentation: `/Users/home/Local Sites/composer-studio/v0-composer-v2/AI_INTEGRATION_PLAN.md`

2. **AI Generation Features**
   - Generate from prompt
   - Enhance existing content
   - Template suggestions
   - Old version: Multiple files in `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/ai/`

**Estimated Timeline:** 4 weeks
**Dependencies:** Anthropic API setup, cost/budget considerations
**Note:** High wow factor but not required for core functionality

---

## Detailed Implementation Specifications

### 1. Row-Based Multi-Column Layout System

**Overview:**
Users need to create multi-column email layouts (e.g., 2-column text + image, 3-column features). Current single-column limitation is not viable for production.

**Design Pattern: Container + Column Split**

#### User Interaction Flow:
1. User drags "Row" block from sidebar (new STRUCTURE category)
2. Row appears as full-width container on canvas
3. Hover over row → Shows column split controls
4. Click column split button → Row reconfigures (1, 2, 3, or 4 columns)
5. Each column becomes a drop zone for nested blocks
6. User drags blocks into columns

#### Visual Structure:
```
┌─────────────────────────────────────────────┐
│  Row Block (2 Columns)                      │
│  ┌────────────────┬────────────────┐        │
│  │ Drop zone      │ Drop zone      │        │
│  │ (Heading here) │ (Image here)   │        │
│  │                │                │        │
│  └────────────────┴────────────────┘        │
│  [⬜ 1col] [⬜⬜ 2col] [⬜⬜⬜ 3col] [⬜⬜⬜⬜ 4col] │
└─────────────────────────────────────────────┘
```

#### Controls in Right Sidebar (when row selected):
- **Column Split:** Visual buttons (not dropdown)
- **Column Widths:**
  - 2-col: 50/50, 60/40, 70/30
  - 3-col: 33/33/33, 50/25/25, 40/30/30
  - 4-col: 25/25/25/25
- **Gap Between Columns:** Slider (0-40px)
- **Vertical Alignment:** Top, Middle, Bottom
- **Background Color:** Color picker
- **Padding:** 4-input grid (top, right, bottom, left)

#### Responsive Behavior:
- Mobile viewport: Columns stack vertically automatically
- User can toggle "Stack on mobile" per row
- Preview with mobile/desktop toggle (already exists)

#### Technical Implementation:

**Files to Create:**
- `/Users/home/Local Sites/designer-email/src/components/blocks/RowBlock.tsx`
- `/Users/home/Local Sites/designer-email/src/components/controls/RowControls.tsx`
- `/Users/home/Local Sites/designer-email/src/types/email.ts` (extend `BlockType` to include `'row'`)

**Reference Implementation:**
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/lib/row-helpers.ts` (helper functions)
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/email-row.tsx` (component)

**Data Structure:**
```typescript
interface RowBlockData {
  columnCount: 1 | 2 | 3 | 4
  columns: {
    id: string
    width: number // percentage
    blocks: EmailBlock[] // nested blocks
    verticalAlign: 'top' | 'middle' | 'bottom'
  }[]
  gap: number // px
  backgroundColor?: string
  padding: { top: number; right: number; bottom: number; left: number }
  stackOnMobile: boolean
}
```

**Drag-and-Drop Considerations:**
- Each column must be a drop zone
- Support drag between columns
- Support reorder within columns
- Highlight drop zones on drag-over

---

### 2. Enhanced Rich Text Editor

**Overview:**
Current inline editing is too limited. Users need formatting, links, lists, and colors for professional email content.

**Design Pattern: Floating Toolbar (Context-Aware)**

#### User Interaction Flow:
1. User clicks text block → Enters edit mode
2. User selects text → Floating toolbar appears above/below selection
3. Toolbar auto-positions (above if space, below if near top)
4. User clicks formatting button → Text updates
5. Click outside or press Escape → Exits edit mode

#### Toolbar Layout:
```
┌───────────────────────────────────────────────────────┐
│ [B] [I] [U] │ [🔗] [🎨] │ [• List] [1. List] │ [H2] [H3] [❝] │
└───────────────────────────────────────────────────────┘
```

**Buttons:**
- **B** - Bold (Cmd+B)
- **I** - Italic (Cmd+I)
- **U** - Underline (Cmd+U)
- **🔗** - Link (opens modal with URL input)
- **🎨** - Text color (opens color picker with presets)
- **• List** - Bullet list
- **1. List** - Numbered list
- **H2, H3** - Heading styles (semantic)
- **❝** - Blockquote (for callouts)

**Additional Controls (show on toolbar or in sidebar):**
- **Font Family:** Dropdown with preview
  - Arial, Georgia, Courier, Times New Roman, Verdana, Tahoma, Trebuchet MS, Palatino
  - Add Google Fonts later (Phase 2)
- **Font Size:** 12-48px slider or input
- **Text Alignment:** Left, Center, Right, Justify
- **Clear Formatting:** Remove all styles

#### Technical Implementation:

**Current Implementation:**
- File: `/Users/home/Local Sites/designer-email/src/components/ui/RichTextToolbar.tsx`
- Already has: Bold, Italic, Link, Color picker
- Missing: Underline, Lists, Headings, Font selection, Alignment

**Reference Implementation:**
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/rich-text-editor.tsx` (586 lines)
- Uses `contentEditable` with `document.execCommand()` (deprecated but widely supported)
- Consider modern alternative: Draft.js or Slate.js (but adds complexity)

**Enhancements Needed:**
1. Add missing toolbar buttons
2. Implement floating positioning logic:
```typescript
const positionToolbar = (selection: Selection) => {
  const rect = selection.getRangeAt(0).getBoundingClientRect()
  const toolbarHeight = 40
  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom

  if (spaceAbove > toolbarHeight + 10) {
    // Position above
    return { top: rect.top - toolbarHeight - 10, left: rect.left }
  } else {
    // Position below
    return { top: rect.bottom + 10, left: rect.left }
  }
}
```
3. Add keyboard shortcuts
4. Add undo/redo support (track text history)

**Dependencies:**
- None (browser native APIs)

---

### 3. Gallery Block

**Overview:**
Users need to showcase multiple images in grid layouts. Critical for e-commerce product displays, event photo galleries, and visual storytelling.

**Design Pattern: Grid with Inline Upload**

#### Visual Structure:
```
┌─────────────────────────────────────────────┐
│  Gallery Block (3 columns)                  │
│  ┌────────┬────────┬────────┐              │
│  │ Image1 │ Image2 │  [+]   │ ← Add button │
│  │        │        │        │              │
│  └────────┴────────┴────────┘              │
│  ┌────────┬────────┬────────┐              │
│  │ Image4 │ Image5 │ Image6 │              │
│  └────────┴────────┴────────┘              │
└─────────────────────────────────────────────┘
```

#### User Interaction Flow:
1. User drags "Gallery" block from sidebar
2. Default: 2-column layout with 1 placeholder
3. Click placeholder → Opens upload dialog (Cloudinary)
4. Image uploads and displays
5. Click [+] button → Adds another image slot
6. Hover image → Shows edit/delete icons
7. Drag images → Reorder within gallery

#### Controls in Right Sidebar:
- **Layout:** [2×2] [3×3] [4×4] visual buttons
- **Gap:** Slider (0-20px)
- **Aspect Ratio:** Square, 4:3, 16:9, Original
- **Border Radius:** Slider (0-20px for rounded corners)
- **Alignment:** Left, Center, Right (for non-full-width)

#### Per-Image Controls (when image selected):
- **URL:** Text input (if not using upload)
- **Alt Text:** Text input (required for accessibility)
- **Link URL:** Optional click destination
- **Crop/Edit:** Opens Cloudinary editor

#### Technical Implementation:

**Files to Create:**
- `/Users/home/Local Sites/designer-email/src/components/blocks/GalleryBlock.tsx`
- `/Users/home/Local Sites/designer-email/src/components/controls/GalleryControls.tsx`

**Reference Implementation:**
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/gallery-block.tsx`
- Uses dynamic grid: `display: grid; grid-template-columns: repeat(3, 1fr)`

**Data Structure:**
```typescript
interface GalleryBlockData {
  images: {
    id: string
    src: string
    alt: string
    linkUrl?: string
    order: number
  }[]
  columns: 2 | 3 | 4
  gap: number // px
  aspectRatio: 'square' | '4:3' | '16:9' | 'original'
  borderRadius: number // px
  alignment: 'left' | 'center' | 'right'
}
```

**Cloudinary Integration:**
- Already exists: `/Users/home/Local Sites/designer-email/src/lib/cloudinary.ts`
- Use transformation API for crops: `https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_400,h_300/{id}.jpg`

---

### 4. Templates System

**Overview:**
New users need starting points. Templates dramatically improve onboarding and reduce time-to-first-email.

**Design Pattern: Modal Gallery with Category Filters**

#### User Flows:

**First-Time User:**
1. App loads → Modal auto-opens: "Start with a template or blank canvas?"
2. User browses templates by category
3. Clicks "Use Template" → Canvas populates
4. User edits template as starting point

**Returning User:**
1. Clicks "Templates" tab in right sidebar → Modal opens
2. Or: Empty canvas shows "Start with Template" button
3. Selects template → Confirms if current work exists: "Replace current design?"

#### Modal Layout:
```
┌─────────────────────────────────────────────────┐
│  Choose a Template                          [×] │
│  ┌─────────────────────────────────────────┐   │
│  │ [All] [Newsletter] [Promo] [Event] ...  │   │ ← Filters
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────┬──────────┬──────────┐           │
│  │ Template │ Template │ Template │           │
│  │ Preview  │ Preview  │ Preview  │           │
│  │ [Use]    │ [Use]    │ [Use]    │           │
│  └──────────┴──────────┴──────────┘           │
│  ┌──────────┬──────────┬──────────┐           │
│  │ ...      │ ...      │ ...      │           │
│  └──────────┴──────────┴──────────┘           │
│                                                 │
│  [← Start from Blank]                           │
└─────────────────────────────────────────────────┘
```

#### Template Categories:
- **Newsletter** - Weekly updates, blog roundups
- **Promotional** - Sales, discounts, product launches
- **Event** - Webinars, conferences, meetups
- **Transactional** - Receipts, shipping confirmations
- **Welcome Series** - Onboarding sequences
- **Announcement** - News, press releases

#### Technical Implementation:

**Files to Create:**
- `/Users/home/Local Sites/designer-email/src/components/modals/TemplatesModal.tsx`
- `/Users/home/Local Sites/designer-email/src/data/templates.ts` (template definitions)

**Reference Implementation:**
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/email-templates.tsx`

**Template Data Structure:**
```typescript
interface EmailTemplate {
  id: string
  name: string
  description: string
  category: 'newsletter' | 'promo' | 'event' | 'transactional' | 'welcome' | 'announcement'
  tags: string[]
  thumbnail: string // preview image
  blocks: EmailBlock[] // pre-configured blocks
  metadata: {
    author?: string
    createdAt: Date
    featured?: boolean
  }
}
```

**Template Storage:**
- Start with 5-10 hardcoded templates
- Later: User-created templates saved to localStorage
- Future: Server-side template library

---

## Sidebar Architecture Redesign

**Current Problem:** Four tabs (Blocks, Style, Templates, Branding) spread functionality too thin and create navigation friction.

### Recommended: Two-Tab Sidebar

**Tab 1: Insert**
- Block library with categories
- Search blocks
- "Add Row" prominent button

**Tab 2: Design**
- Selected block properties (if block selected)
- Global email settings (if nothing selected)
- Common controls

**Templates & Branding → Modals**
- Templates: Triggered by button or Cmd+T
- Branding: Settings button in top nav

#### Benefits:
- Reduces cognitive load (fewer navigation decisions)
- Block library always one click away
- Properties appear automatically when block selected
- Mirrors user intention: "Add content" vs "Edit content"

#### Implementation:
- Refactor `RightSidebar.tsx`
- Move templates to modal component
- Move branding to modal component
- Update tab structure

---

## Critical Dependencies & Requirements

### Required npm Packages (Not Currently Installed):
- `react-hot-toast` - Toast notifications
- Consider: `@dnd-kit/sortable` (already installed)
- Consider: `react-dropzone` (if not using Cloudinary widget)

### Environment Variables Required:
```env
# Already configured:
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_RESEND_API_KEY=your_resend_key
VITE_RESEND_FROM_EMAIL=noreply@yourdomain.com

# Future (AI Integration):
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

### Browser Compatibility:
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Email client compatibility: Test with Litmus or Email on Acid
- No IE11 support required (good!)

---

## Risk Assessment

### Technical Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Row layout complexity breaks DnD | Medium | High | Extensive testing, use dnd-kit's nested containers |
| Rich text editor XSS vulnerabilities | Medium | High | Strict HTML sanitization, allowlist approach |
| Cloudinary upload failures | Low | Medium | Fallback to URL input, clear error messages |
| Performance with large emails (50+ blocks) | Medium | Medium | Virtual scrolling, lazy rendering |
| Browser inconsistencies (rich text) | High | Low | Limit to well-supported features, test matrix |

### UX Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Users confused by row/column system | Medium | High | Clear onboarding, help tooltips, templates |
| Feature overwhelm with 17 block types | Medium | Medium | Good categorization, search, progressive disclosure |
| Templates feel limiting, not starting points | Low | Medium | Emphasize editability, show "customize" messaging |
| Version history causes data loss fears | Low | High | Clear labeling, preview before restore, confirmations |

---

## Success Metrics

### Phase 1 Success Criteria:
- ✅ Users can create 2-column layouts
- ✅ Rich text editor supports all basic formatting
- ✅ Gallery block handles 3+ images
- ✅ HTML export generates valid, email-client-compatible code
- ✅ Zero critical bugs for 1 week

### Phase 2 Success Criteria:
- ✅ 80% of new users start with a template
- ✅ Video and footer blocks used in 50%+ of emails
- ✅ Branding system reduces design time by 30%
- ✅ Test email delivery rate > 95%

### Phase 3 Success Criteria:
- ✅ Version history prevents 0 data loss incidents
- ✅ Users revert to previous versions 5+ times per week (indicates confidence)
- ✅ All block types have > 10% adoption

---

## Timeline Summary

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| **Phase 1: Foundation** | 3 weeks | High | Critical |
| **Phase 2: Professional** | 3 weeks | Medium | High |
| **Phase 3: Advanced** | 4 weeks | Medium | Medium |
| **Phase 4: AI** | 4 weeks | High | Low (Optional) |
| **Total (without AI)** | **10 weeks** | - | - |
| **Total (with AI)** | **14 weeks** | - | - |

**Recommended Approach:** Ship Phase 1 + Phase 2 as MVP (6 weeks), then iterate based on user feedback.

---

## Next Steps

### Immediate Actions (This Week):
1. ✅ **Remove `ProgressStepper.tsx`** (design-agent recommendation)
2. ✅ **Fix canvas empty state text** (right sidebar, not left)
3. ✅ **Change "Saved" badge to green** (semantic correctness)
4. ✅ **Remove canvas asymmetric padding** (`pl-16` → `p-6`)
5. ✅ **Add toast notifications library** (`npm install react-hot-toast`)

### Phase 1 Kickoff (Next Week):
1. Design row/column data structures
2. Create `RowBlock.tsx` component skeleton
3. Update `BlockLibrary.tsx` with STRUCTURE category
4. Implement basic 1-2 column layouts
5. Add row controls to sidebar

### Ongoing:
- Document all new components
- Write unit tests for complex logic
- Test on major email clients (Gmail, Outlook, Apple Mail)
- Gather user feedback early and often

---

## Reference Files

### Current Codebase:
- `/Users/home/Local Sites/designer-email/src/components/layout/EditorLayout.tsx`
- `/Users/home/Local Sites/designer-email/src/components/layout/RightSidebar.tsx`
- `/Users/home/Local Sites/designer-email/src/components/layout/BlockLibrary.tsx`
- `/Users/home/Local Sites/designer-email/src/components/layout/Canvas.tsx`
- `/Users/home/Local Sites/designer-email/src/components/ui/RichTextToolbar.tsx`
- `/Users/home/Local Sites/designer-email/src/lib/cloudinary.ts`
- `/Users/home/Local Sites/designer-email/src/lib/htmlGenerator.ts`

### Previous Codebase (Reference):
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/email-editor.tsx`
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/rich-text-editor.tsx`
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/lib/structured-email-generator.ts`
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/lib/row-helpers.ts`
- `/Users/home/Local Sites/composer-studio/v0-composer-v2/components/blocks/` (17 block types)

---

## Appendix: Design System Quick Reference

### Color Palette:
```css
--color-primary: #1e3a5f       /* Dark blue - headers */
--color-primary-light: #3b82f6 /* Light blue - interactive */
--color-success: #10b981       /* Green - success states */
--color-warning: #f59e0b       /* Amber - warnings */
--color-error: #ef4444         /* Red - errors */
--color-bg-canvas: #f3f4f6     /* Canvas background */
--color-bg-panel: #ffffff      /* Sidebar background */
```

### Spacing Scale:
- `space-xs`: 4px - Tight elements
- `space-sm`: 8px - Related controls
- `space-md`: 16px - Section padding
- `space-lg`: 24px - Block separation
- `space-xl`: 32px - Major sections

### Typography Scale:
- `text-xs`: 12px - Labels, captions
- `text-sm`: 14px - Body text, controls
- `text-base`: 16px - Default body
- `text-lg`: 18px - Subheadings
- `text-xl`: 20px - Headings

---

**Document Version:** 1.0
**Last Updated:** December 5, 2025
**Prepared By:** Code-Reviewer Agent + Design-Agent
**Status:** Ready for Implementation
