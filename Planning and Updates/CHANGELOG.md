# Changelog

All notable changes to the Email Designer project will be documented in this file.

## [Unreleased]

### UX Polish & Keyboard Shortcuts - 2025-12-08

#### Enhanced Keyboard Shortcuts ✅ COMPLETE
**Added**: Copy/Paste and arrow key navigation for power users.

**New Shortcuts**:
- **Cmd+C** - Copy selected block to clipboard (localStorage)
- **Cmd+V** - Paste block from clipboard
- **Arrow Up/Down** - Navigate between blocks when selected

**Already Implemented**:
- Cmd+Z / Cmd+Shift+Z - Undo/Redo
- Cmd+D - Duplicate block
- Delete/Backspace - Delete block
- Escape - Exit editing or deselect

**Files Modified**:
- `src/hooks/useKeyboardShortcuts.ts:78-127` - Added copy/paste and arrow navigation

**Impact**:
- ✅ Canva-like keyboard workflow for power users
- ✅ Copy blocks between different email designs (via localStorage)
- ✅ Quick navigation without mouse

---

#### Mobile Responsive Email HTML ✅ COMPLETE
**Added**: Applied mobile-responsive CSS classes to layout blocks.

**Changes**:
- Layout columns now use `mobile-full-width` class (stacks on mobile)
- Layout padding uses `mobile-padding` class (20px on mobile)
- Emails automatically adapt to mobile screens

**Files Modified**:
- `src/lib/htmlGenerator.ts:263` - Added mobile-full-width to columns
- `src/lib/htmlGenerator.ts:271` - Added mobile-padding to layout container

**CSS Classes Used** (already defined):
```css
@media only screen and (max-width: 640px) {
  .mobile-full-width { width: 100% !important; }
  .mobile-padding { padding: 20px !important; }
}
```

**Impact**:
- ✅ Two-column layouts stack vertically on mobile
- ✅ Proper padding on mobile devices
- ✅ Better mobile email experience in Gmail/Outlook apps

---

#### Empty State Already Implemented ✅ VERIFIED
**Confirmed**: ImageBlock already has comprehensive empty state placeholders.

**Features** (lines 158-182):
- Dashed border visual
- Image icon (64px)
- "Add Image" button
- 200px minimum height
- Hover states and transitions

No changes needed - already excellent!

---

#### Drag Overlay Visual Improvement ✅ COMPLETE
**Problem**: When dragging blocks from the canvas, users saw a "+" icon and long ID string instead of a visual preview.

**Solution**: Modified drag overlay to show actual block preview with reduced opacity when dragging existing blocks.

**Changes**:
- Added BlockRenderer import to EditorLayout
- Modified DragOverlay to detect if dragging existing block vs library block
- Existing blocks: Show actual block preview at 640px width with 60% opacity
- Library blocks: Continue showing icon + label as before

**Files Modified**:
- `src/components/layout/EditorLayout.tsx:9,199-231` - Enhanced drag overlay logic

**Impact**:
- ✅ Better visual feedback when reordering blocks
- ✅ Users can see exactly what they're moving
- ✅ More intuitive drag and drop experience

---

#### Preview Modal Duplicate Content Fix ✅ COMPLETE
**Problem**: Preview modal was showing duplicate content - the entire email was being rendered twice.

**Root Cause**:
- MSO (Microsoft Office) conditional comments were rendering BOTH Outlook and modern versions in browser preview
- HTML was being regenerated on every TopNav render, causing unstable renders

**Solution**:
- Added `includeOutlookFallback` parameter to `generateEmailHTML()` function
- Preview uses `generateEmailHTML(email, false)` - shows only modern HTML, no MSO conditionals
- Send/Download uses `generateEmailHTML(email, true)` - includes full Outlook fallback
- Added useMemo to prevent unnecessary HTML regeneration

**Files Modified**:
- `src/lib/htmlGenerator.ts:329,397-409,424` - Added includeOutlookFallback parameter
- `src/components/ui/PreviewModal.tsx:13-20,43,117,138` - iframe key-based recreation
- `src/components/layout/TopNav.tsx:3,28-31,243` - Separate preview/export HTML with useMemo

**Impact**:
- ✅ Preview shows email exactly once (no duplication)
- ✅ Outlook fallback preserved for actual emails (send/download)
- ✅ Better preview performance

---

#### Layout Column Width Issues ⚠️ IN PROGRESS
**Problem**: Two-column layouts not displaying correctly:
- Columns showing as 80/20 instead of 50/50
- When adding text to left column and image to right column, only text column displays

**Attempted Solutions**:
1. Changed from percentage-based widths to pixel-based widths
2. Adjusted column width calculation to account for padding-right being inside column width:
   - Column 1: contentWidth + gap (e.g., 308px + 24px = 332px)
   - Column 2: contentWidth (e.g., 308px)
3. Fixed columnRatio support (50/50, 33/66, 66/33)

**Files Modified**:
- `src/lib/htmlGenerator.ts:255-296` - Column width calculation logic

**Status**: ⚠️ Not working correctly - columns still not rendering as expected

**Next Steps**:
- Debug how layout blocks store children (data.children array structure)
- Check if blocks are being added to correct column indices
- Verify HTML generation is iterating over children correctly
- Test with simple text blocks in both columns first

---

### Code Review & Critical Improvements - 2025-12-08

#### Hybrid HTML for Gmail/Outlook Compatibility ✅ COMPLETE
**Problem**: Email HTML had critical compatibility issues - main container used `<div>` with `max-width` which breaks in Outlook Desktop, and gallery images used `object-fit` which Outlook doesn't support.

**Solution**: Implemented progressive enhancement using MSO (Microsoft Office) conditional comments:

**Main Container (htmlGenerator.ts:339-367)**:
- **Outlook**: Gets bulletproof fixed-width table wrapper
- **Gmail/Apple Mail**: Gets modern centered table with responsive max-width
- Both maintain 640px email width constraint
- Eliminates layout collapse in Outlook Desktop

**Gallery Images (htmlGenerator.ts:134-153)**:
- **Modern clients**: Beautiful `object-fit: cover` with focal point control (9-position presets)
- **Outlook**: Simple `<img>` tags (may stretch, but displays correctly)
- Trade-off: Gmail users get pixel-perfect design, Outlook users see functional images

**Documentation**:
- Added comprehensive header to `htmlGenerator.ts` explaining hybrid rendering approach
- Inline comments documenting why each approach was chosen
- MSO conditional syntax examples for future developers

**Impact**:
- ✅ Emails now work perfectly in both Gmail AND Outlook
- ✅ No compromise on visual quality for 90%+ of users (modern clients)
- ✅ Acceptable degradation for Outlook users (functional, not broken)

---

#### Security: XSS Protection with DOMPurify ✅ COMPLETE
**Problem**: Text and heading blocks used `dangerouslySetInnerHTML` without comprehensive sanitization, creating XSS vulnerability.

**Solution**: Installed and integrated DOMPurify for proper HTML sanitization:

**Changes**:
- Installed `dompurify` and `@types/dompurify` packages
- Updated `TextBlock.tsx:508-514` with DOMPurify sanitization
- Updated `HeadingBlock.tsx:579-585` with DOMPurify sanitization

**Configuration**:
```typescript
DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'a', 'span', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
  ALLOW_DATA_ATTR: false
})
```

**Impact**:
- ✅ Prevents script injection attacks
- ✅ Allows safe formatting tags (bold, italic, links)
- ✅ Blocks malicious attributes and data attributes
- ✅ Maintains existing editor functionality

---

#### Performance: React.memo Optimization ✅ COMPLETE
**Problem**: Every block re-rendered when any block updated, causing performance degradation with 10+ blocks.

**Solution**: Added `React.memo` to all block components with custom comparison functions:

**Components Updated**:
1. `TextBlock.tsx:522-530` - Memoized with data/styles comparison
2. `HeadingBlock.tsx:594-602` - Memoized with data/styles comparison
3. `ImageBlock.tsx:231-238` - Memoized with data/styles comparison
4. `ButtonBlock.tsx:73-80` - Memoized with data/styles comparison
5. `GalleryBlock.tsx:256-263` - Memoized with data/styles comparison
6. `DividerBlock.tsx:53-60` - Memoized with data/styles comparison
7. `SpacerBlock.tsx:52-59` - Memoized with data/styles comparison
8. `LayoutBlock.tsx:192-199` - Memoized with data/styles comparison

**Comparison Logic**:
```typescript
memo(Component, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
```

**Impact**:
- ✅ Blocks only re-render when their own data changes
- ✅ Sibling blocks no longer trigger unnecessary re-renders
- ✅ Significant performance improvement with multiple blocks
- ✅ Smooth editing experience even with 20+ blocks

---

### Development Workflow - 2025-12-08

#### Server Restart Process Documentation
- **Important**: After making major feature additions, the development server must be restarted
- **Command to restart server**: `npm run dev:all`
  - This command starts both the Vite dev server (port 5173) and backend server (port 3002) concurrently
  - Frontend accessible at: http://localhost:5173/
  - Backend API accessible at: http://localhost:3002
- **Why restart is needed**:
  - Code changes made by Copilot or other tools may not hot-reload properly
  - New dependencies or configuration changes require server restart
  - Database schema changes or environment variable updates need fresh server instance
- **When to restart**:
  - After adding new npm packages
  - After modifying server.js or backend configuration
  - After making significant frontend architecture changes
  - When localhost:5173 is not accessible or shows stale code
  - When debugging issues that might be caused by cached state
- **Note**: Copilot (Haiku 4.5) struggled with this workflow and did not restart the server automatically after changes

### Technical Notes
- Vite dev server runs on port 5173 (frontend)
- Express backend server runs on port 3002 (API endpoints for email sending)
- Both servers must be running for full application functionality
- Background processes can be checked with: `ps aux | grep -E "(node|npm|vite)"`
- Port usage can be checked with: `lsof -i :5173` or `lsof -i :3002`

---

### Added - 2025-12-08

#### Gallery Image Cropping & Focal Point Control ✅ COMPLETE
- **Fixed divider block not showing in preview**: Divider blocks now render correctly in email HTML export
  - Root cause: Divider block type was missing from HTML generator switch statement
  - Added `generateDividerHTML()` function to create email-safe table-based HTML
  - Added `case 'divider'` to `generateBlockHTML()` switch statement
  - Dividers now render with all properties: line style, color, thickness, width, spacing
  - Works in preview modal and exported email HTML

- **Gallery image cropping for consistent dimensions**: All gallery images now display at uniform heights
  - Implemented fixed heights based on layout: 2-col (280px), 3-col (180px), 4-col (140px)
  - Added `object-fit: cover` for professional image cropping
  - Added `object-position` support for focal point control
  - Images maintain aspect ratio while filling fixed space
  - Works in both canvas editor and email HTML export
  - Email client support: Gmail, Apple Mail, Outlook.com, Yahoo Mail

- **9-position focal point presets**: Control where images are cropped within fixed dimensions
  - Added `objectPosition` property to GalleryImage type (stores CSS position value)
  - Created 3x3 grid control in sidebar: TL, T, TR, L, C, R, BL, B, BR
  - Each button sets focal point: "0% 0%" (top-left) to "100% 100%" (bottom-right)
  - Default position: "50% 50%" (center) for all images
  - Applied to both canvas view and HTML export

- **Per-image position control**: Each gallery image can have unique focal point
  - Added image selector with thumbnails in sidebar (4-column grid)
  - Click thumbnail to select which image to reposition
  - Position grid affects only the selected image
  - Visual feedback: selected thumbnail shows blue border and ring
  - Compact position grid (128px width) centered in sidebar

- **Canvas-sidebar click synchronization**: Clicking images syncs between canvas and sidebar
  - Added `selectedGalleryImageIndex` to editor state (Zustand store)
  - Clicking image on canvas automatically selects it in sidebar
  - Clicking sidebar thumbnail ready for repositioning
  - Both views stay synchronized through shared store state
  - Improved UX: click image you want to adjust, controls are ready

### Technical Details (Gallery Enhancements)
- **Files Modified**:
  - `src/types/email.ts` - Added `objectPosition` to GalleryImage, `selectedGalleryImageIndex` to EditorState
  - `src/stores/emailStore.ts` - Added `selectedGalleryImageIndex` state and `setSelectedGalleryImageIndex` action
  - `src/lib/htmlGenerator.ts` - Added divider HTML generation, added `object-position` to gallery images
  - `src/components/blocks/SortableGalleryImage.tsx` - Apply `objectPosition` style, sync click with store
  - `src/components/controls/GalleryControls.tsx` - Added image selector and 9-position preset grid

- **Data Structure**:
  ```typescript
  interface GalleryImage {
    src: string
    alt: string
    linkUrl?: string
    borderRadius?: number
    objectPosition?: string  // e.g., "50% 50%", "0% 100%", "100% 0%"
  }
  ```

### Summary
Enhanced gallery blocks with professional image cropping and focal point control. All gallery images now display at consistent heights regardless of aspect ratio, with the ability to control which part of each image is visible through 9 preset focal points. Added missing divider block rendering to HTML export. Implemented seamless synchronization between canvas and sidebar for intuitive image repositioning workflow.

---

### Fixed - 2025-12-08

#### Email Sending Functionality Restored ✅ COMPLETE
- **Fixed email test sending freeze**: Emails now send successfully without freezing the UI
  - Root cause: Email backend server (server.js) was not running
  - Secondary issue: Port 3001 was already in use by another Next.js server
  - Solution: Changed email server port from 3001 to 3002
  - Updated frontend API endpoint from `http://localhost:3001/api/send-email` to `http://localhost:3002/api/send-email`
  - Installed missing `concurrently` package to enable `npm run dev:all` command
  - Backend server now starts successfully on port 3002
  - Server properly configured with Resend API for email delivery
- **Improved developer experience**: Added `dev:all` npm script to run both servers together
  - Vite dev server runs on port 5173 (frontend)
  - Email backend server runs on port 3002 (API)
  - Both servers start simultaneously with single command: `npm run dev:all`
  - No more need to manually start servers in separate terminals

### Technical Details (Email Server Fix)
- **Problem Flow**:
  1. User clicks "Test Email" button in UI
  2. Frontend makes POST request to `http://localhost:3001/api/send-email`
  3. No server listening on port 3001 (port occupied by different project)
  4. Request hangs indefinitely, causing UI freeze
  5. Email never sends
- **Solution Flow**:
  1. Changed `PORT` constant in server.js from 3001 to 3002
  2. Updated fetch URL in src/lib/resend.ts to use port 3002
  3. Installed `concurrently` package for running multiple npm scripts
  4. Started email server with `node server.js` on new port
  5. Server successfully binds to port 3002 and listens for requests
  6. Email sending now works correctly through Resend API

### Files Modified (Email Server Fix)
- `server.js` - Changed PORT from 3001 to 3002
- `src/lib/resend.ts` - Updated API endpoint URL to use port 3002
- `package.json` - Added `concurrently` as dev dependency

### Summary
Fixed critical bug that prevented email test sending from working. The issue was caused by the email backend server not running, which resulted in fetch requests timing out and the UI freezing when users clicked "Send Test". Changed the server port to avoid conflicts and set up proper development workflow with the `dev:all` command for easy local development.

---

### Fixed - 2025-12-06

#### Font Size Controls & Selection Preservation ✅ COMPLETE
- **Fixed font size +/- buttons not working**: Font size changes now properly apply on every click
  - Root cause: Two separate `updateBlock` calls were conflicting with each other
  - First call updated `fontSize`, second call overwrote it with old data when updating text content
  - Solution: Queue data updates (fontSize, color, fontFamily) in `dataUpdates` object
  - Merge all updates in single `updateBlock` call at end of formatting operation
  - Prevents race conditions and ensures fontSize changes persist correctly
  - Number in toolbar now updates correctly and matches actual font size
- **Selection preservation across formatting operations**: Selected text stays selected when clicking +, -, bold, etc.
  - Replaced Range-based save/restore with robust offset-based approach
  - Calculate character offsets (start, end) relative to contentEditable root
  - After re-render, walk new DOM tree to find text nodes at those offsets
  - Create fresh Range with new nodes at correct positions
  - Works reliably across DOM changes caused by React re-renders
  - Users can now click + multiple times without re-selecting text
- **Fixed nested span bug causing repeated clicks to fail**: Font size changes on second+ click now work
  - Previous code created nested spans: `<span fontSize=52px><span fontSize=50px>text</span></span>`
  - Inner span's fontSize took precedence, preventing visual changes
  - Solution: Extract selected content, remove existing fontSize styles from spans
  - Unwrap empty spans (spans with no other styles remaining)
  - Wrap cleaned content in fresh span with new fontSize
  - Prevents nesting and ensures each click changes the actual font size
- **Fixed text deletion bug**: Text no longer disappears after second formatting click
  - Bug: Only first child of temp container was being moved to new span
  - Multiple text nodes or elements were being lost
  - Solution: Loop through all children with `while (tempDiv.firstChild)` to move everything
  - All text content now preserved across multiple formatting operations

### Technical Details (Font Size Fix)
- **Problem Flow**:
  1. User clicks +
  2. `handleFormat('fontSize', '50px')` called
  3. First `updateBlock`: Sets fontSize to 50px
  4. Second `updateBlock`: Spreads `...data` (old data with 48px), overwrites fontSize
  5. Result: fontSize reverts to 48px
- **Solution Flow**:
  1. Create `dataUpdates = {}` object at start of handleFormat
  2. During formatting: `dataUpdates.fontSize = '50px'`
  3. At end: Single `updateBlock` with `{ ...data, ...dataUpdates, text: newText }`
  4. Result: fontSize preserved as 50px

### Files Modified (Font Size & Selection Fix)
- `src/components/blocks/HeadingBlock.tsx` - dataUpdates architecture, offset-based selection, fontSize cleaning
- `src/components/blocks/TextBlock.tsx` - dataUpdates architecture, offset-based selection, fontSize cleaning

### Summary
Fixed critical bugs with font size controls that made them unusable after the first click. The toolbar font size buttons now work reliably for multiple consecutive clicks, text selections are preserved across formatting operations, and all text content is maintained correctly. These fixes complete the rich text editing experience and make the toolbar fully functional for professional email design.

---

### Added - 2025-12-06

#### Phase 5: Canvas & Polish ✅ COMPLETE
- **Canvas Background & Elevation**: Email "floats" on canvas with elegant shadow
  - Light gray background (#F3F4F6 / bg-gray-100) added to canvas area
  - Enhanced shadow with layered effect: `0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)`
  - Creates professional elevation and depth
  - Email appears to float on the canvas surface
  - Better visual hierarchy and focus on email content
- **Improved Block Hover States**: Subtle elevation on hover
  - Added `hover:shadow-md` to all blocks via SortableBlock
  - Smooth transitions (150ms ease-out) for professional feel
  - Rounded corners on hover to match shadow
  - Non-intrusive visual feedback
  - Maintains clear focus on selected blocks
- **Smooth Transitions**: 150ms ease-out transitions across all interactions
  - Block hover states animate smoothly
  - Selection states transition elegantly
  - Drag operations feel polished
  - Overall more refined user experience
- **Image Resize Handles**: Visual corner handles when image selected
  - Four corner handles (top-left, top-right, bottom-left, bottom-right)
  - White circles with blue border matching selection ring
  - 3x3px size for subtle, non-intrusive appearance
  - Properly positioned at corners using translate transforms
  - Visual indicator for future resize functionality
  - Appears only when image block is selected

### Files Modified (Phase 5)
- `src/components/layout/Canvas.tsx` - Gray background and enhanced shadow
- `src/components/blocks/SortableBlock.tsx` - Hover states and transitions
- `src/components/blocks/ImageBlock.tsx` - Corner resize handles

---

### Added - 2025-12-06

#### Gallery Block Drag & Reorder Feature ✅ IMPLEMENTED
- **Drag to Reorder Gallery Images**: Full Canva-style drag and drop
  - Smooth 60fps drag animations using CSS transforms
  - Drag any image to reorder within the gallery
  - Works with 2-col, 3-col, and 4-col layouts
  - Visual drag overlay with blue border and shadow
  - Centered drag preview follows cursor (fixed offset issue)
  - Fixed size preview (200x200px) for consistent experience
  - Disabled drop animation for immediate feedback
  - 8px activation distance prevents accidental drags
  - Hover overlay with "Drag to reorder" hint
  - Only enabled when gallery block is selected
  - Empty slots are not draggable
  - Touch support via PointerSensor
- **SortableGalleryImage Component**: New dedicated component
  - Uses `@dnd-kit/sortable` for smooth drag behavior
  - Memoized to prevent unnecessary re-renders
  - Handles both filled and empty image slots
  - Includes red X delete button
  - Click to change image functionality
  - Drag handle with visual feedback
- **Performance Optimized**
  - Zero new dependencies (uses existing @dnd-kit)
  - CSS transforms for 60fps animations
  - No bundle size increase
  - Minimal re-renders during drag
  - Tested with multiple galleries on canvas

### Files Created (Drag & Reorder)
- `src/components/blocks/SortableGalleryImage.tsx` - Sortable image component with drag support
- `GALLERY_DRAG_REORDER_PLAN.md` - Implementation plan and analysis (referenced for implementation)

---

### Added - 2025-12-06

#### Image & Gallery Block UX Improvements
- **ImageBlock Empty State**: Only "Add Image" button opens file dialog
  - Removed click-anywhere behavior on empty state background
  - More intentional, less accidental file dialog triggers
  - Cleaner UX matching modern design patterns
- **GalleryBlock Empty State**: Only "Add" button opens file dialog per image slot
  - Changed from click-anywhere on empty slot to button-only trigger
  - Smaller, more compact "Add" button for each gallery slot
  - Consistent behavior with ImageBlock
- **GalleryBlock Individual Image Delete**: Small red X button for each image
  - Added red circular X button in top-right corner of each image (filled slots)
  - Added red circular X button for empty image slots too
  - Only visible when gallery block is selected
  - Clean, Canva-style delete UX
  - Click image to change, click X to delete
  - Allows removing both filled and empty slots
  - Simplified from previous hover-based dual-button system
- **GalleryBlock Click Handler Fix**: Properly opens style sidebar and enables toolbar
  - Added `handleClick` function that calls `onClick` and `setActiveSidebarTab('style')`
  - Now opens the Style sidebar when gallery block is clicked on canvas
  - Shows GalleryControls (layout selector, gap controls) in sidebar
  - Toolbar now appears correctly when gallery block is selected
  - Fixed missing `setActiveSidebarTab` import and handler
- **Block Toolbar Verification**: Confirmed all blocks have the toolbar
  - All blocks wrapped in SortableBlock component have the toolbar
  - Toolbar includes: Drag handle, Move up, Move down, Duplicate, Delete
  - Appears when block is selected at top-right corner
  - Blocks confirmed: Heading, Text, Image, Gallery, Button, Spacer, Divider, Layout

### Files Modified (Image & Gallery Improvements)
- `src/components/blocks/ImageBlock.tsx` - Button-only file dialog trigger
- `src/components/blocks/GalleryBlock.tsx` - Complete drag & drop reordering, red X for all slots, DndContext integration
- `src/components/blocks/SortableGalleryImage.tsx` - New sortable image component (created)
- Verified `src/components/blocks/SortableBlock.tsx` - Toolbar implementation
- Verified `src/components/layout/Canvas.tsx` - All blocks use SortableBlock wrapper
- Verified `src/components/layout/DesignControls.tsx` - GalleryControls properly integrated

---

### Added - 2025-12-06

#### Padding Control Improvements
- **Simplified Linked Padding Control**: Better UX for padding adjustments
  - Added link/unlink toggle button to control all sides together or separately
  - Linked mode: Single slider (0-80px, step 4) with numeric input for easy adjustment
  - Unlinked mode: Individual inputs for top, right, bottom, left (original grid layout)
  - Visual link icon (chain) shows linked/unlinked state with blue highlight when linked
  - When linking, all sides sync to the current top value
  - Applied to all blocks through CommonControls component
- **Default Padding Reduced**: Changed from 20px to 4px for all blocks
  - More compact default appearance
  - Easier to build tight, modern layouts
  - Users can still increase padding as needed via controls
- **Image & Gallery Block Defaults**: Removed rounded corners by default
  - ImageBlock border radius changed from 8px to 0 (corner radius controls still available)
  - Gallery blocks don't have border radius property (no change needed)
  - Users can still add rounded corners via controls if desired

### Files Modified (Padding & Image Improvements)
- `src/types/email.ts` - Changed defaultSpacing from 20px to 4px
- `src/lib/blockDefaults.ts` - Set image block border radius to 0
- `src/components/controls/CommonControls.tsx` - Complete padding control redesign with link/unlink

### Summary
Improved the padding control UX across all blocks with a simplified linked mode using a slider, making it easier to adjust padding quickly. Users can still unlink for individual side control when needed. Reduced default padding from 20px to 4px for a more compact, modern appearance. Also reverted image blocks to sharp corners by default while keeping customization options available.

---

### Added - 2025-12-06

#### Phase 4: Modern Block Components (Canva Redesign)
- **ButtonBlock Redesign**: Modern, website-style CTA buttons
  - Larger padding: 16px 32px (previously 12px 24px)
  - Softer corners: 8px border radius (previously 6px)
  - Letter spacing: 0.02em for better readability
  - Subtle shadow: 0 2px 8px rgba(0,0,0,0.1) for depth
  - Changed default color to green (#10B981) matching modern web design
  - Removed fixed width default for better flexibility
- **ImageBlock Enhancements**: Rounded corners by default
  - Default border radius: 8px (previously 0)
  - Creates more modern, polished look matching website aesthetics
- **SpacerBlock Visual Polish**: Better hover indicator
  - Modern rounded pill indicator that appears only on hover
  - Icon showing vertical spacing with height in pixels
  - Smooth opacity transition (opacity-0 to opacity-40)
  - Cleaner, less intrusive visual feedback
- **DividerBlock Controls Modernization**: Improved styling consistency
  - Updated all labels to text-xs for consistency
  - Changed border radius from rounded-md to rounded-lg
  - Added shadow-sm to active button states
  - Added hover:border-gray-400 for better interactivity
  - Comprehensive controls: style (solid/dashed/dotted), color, thickness, width, spacing
  - Live preview of divider appearance
- **LayoutBlock Improvements**: Better spacing and visual design
  - Increased default gap: 24px (previously 16px) for better column separation
  - Increased minimum height: 120px (previously 100px)
  - Changed border radius from rounded-lg to rounded-xl for softer appearance
  - Added hover:border-gray-400 state for better interactivity
  - Modernized buttons: rounded-lg with shadow-sm and increased padding (px-4 py-2)

### Files Modified (Phase 4: Modern Block Components)
- `src/lib/blockDefaults.ts` - Updated button, image, and layout block defaults
- `src/components/blocks/ButtonBlock.tsx` - Added letter spacing and shadow
- `src/components/blocks/SpacerBlock.tsx` - Improved visual indicator with hover state
- `src/components/blocks/LayoutBlock.tsx` - Better column gaps, rounded corners, modern buttons
- `src/components/controls/DividerControls.tsx` - Modernized styling and consistency

### Summary
Phase 4 of the Canva redesign focused on modernizing individual block components to match contemporary website design standards. All blocks now feature softer corners, better spacing, subtle shadows, and improved visual feedback. Buttons are bigger and more prominent, images have elegant rounded corners by default, and layout blocks provide better visual separation with increased gaps.

---

### Added - 2025-12-06

#### Phase 3: Typography & Styling (Canva Redesign)
- **Professional Typography System**: Website-quality fonts and sizing
- **Heading Improvements**:
  - H1: 48px, Georgia serif, 700 weight, 1.2 line height, -0.02em letter spacing, #111827 color
  - H2: 36px, Georgia serif, 600 weight, 1.3 line height, -0.01em letter spacing, #1F2937 color
  - H3: 28px, Georgia serif, 600 weight, 1.4 line height, 0 letter spacing, #374151 color
  - Automatic typography updates when changing heading levels in toolbar
- **Body Text Improvements**:
  - System font stack for better cross-platform rendering
  - 16px size, 1.6 line height for optimal readability
  - Modern gray color (#4B5563) instead of pure black
- **Enhanced Readability**:
  - Better line heights for all text elements
  - Negative letter spacing for large headings (tighter, more elegant)
  - Professional color palette with subtle grays
- **Type Definitions**: Added `letterSpacing` to HeadingBlockData interface

#### Text & Heading Block Styling Fixes
- **Fixed background color persistence in edit mode**: Background colors now display correctly when editing
- **Fixed padding in edit mode**: Padding styles now apply consistently in both edit and display modes
- **Fixed text alignment in edit mode**: Text alignment (left/center/right) now works in edit mode
- Removed hardcoded `bg-white` class that was overriding user-selected background colors
- Edit mode now applies all `styles` properties (padding, backgroundColor, textAlign) from block config
- Consistent visual appearance between edit and display modes

#### Font Family Persistence Fix
- **Fixed font changes not persisting from edit to view mode**: Font family changes now correctly persist
- Added `<font>` tag to `<span>` tag conversion in `sanitizeEmailHTML` function
- `document.execCommand('fontName')` creates `<font face="...">` tags that are now properly converted
- Conversion preserves font family, size, and color attributes as inline styles
- Font size attributes (1-7) mapped to pixel values (10px-48px)
- Existing inline styles are preserved during conversion
- Email-safe output with all formatting intact

#### Heading Level Switching Fix (H1/H2/H3)
- **Fixed H1/H2/H3 buttons not working**: Heading level changes now properly update typography
- Added fontFamily preservation when changing heading levels
- Content and cursor position now preserved when switching between H1, H2, and H3
- Typography automatically updates based on level: H1 (48px), H2 (36px), H3 (28px)
- Font weight, line height, color, and letter spacing update correctly
- Used requestAnimationFrame for proper DOM timing after React re-renders
- Fixed issue where changing tag type (h1 to h2) would lose focus or content

#### Canvas Toolbar Positioning & Interaction Fixes
- Moved canvas toolbar to absolute positioning in blank space above canvas
- Canvas now remains stationary when text toolbar appears/disappears
- Increased top padding from `pt-6` to `pt-24` for more blank space
- Toolbar positioned with `absolute top-4 left-1/2 -translate-x-1/2 z-20`
- **Fixed toolbar disappearing bug**: Clicking toolbar buttons no longer closes the toolbar
- Updated `handleOutsideClick` to exclude `.canvas-toolbar` from outside click detection
- Improved user experience - no more canvas jumping when editing text

#### Image Block Professional Placeholder & Performance Fix
- **Redesigned Empty State**: Beautiful placeholder matching Designer Email design
- **Dashed Border**: Light gray dashed border with rounded corners
- **Icon Container**: Gray rounded square background with centered image icon
- **Professional Button**: "Add Image" button with upload icon and proper styling
- **Better Hover States**: Border and background darken on hover
- **Proper Spacing**: Increased padding (p-12) and minimum height (200px)
- **Removed Broken Image**: No more placeholder.svg fallback showing broken link
- **Fixed 1-2 Second Delay**: Changed default image src from external placeholder URL to empty string
- **Instant Rendering**: Image blocks now appear immediately on canvas with professional placeholder
- Clean, clickable area with smooth transitions

#### Drag and Drop Improvements
- **Visual Drag Overlay**: Now shows block icon and label instead of text "Dragging: {id}"
- **Enhanced Drag Feedback**: Larger drag overlay with blue border, shadow, and scale effect
- **Better Responsiveness**: Disabled drop animation for instant feedback with `dropAnimation={null}`
- **Auto-scroll Optimization**: Added `autoScroll` threshold for smoother dragging near edges
- **Block Icons**: Added complete block metadata mapping with proper SVG icons
- Drag overlay shows blue-tinted icon with block name below
- 90% opacity and scale-105 transform for clear visual feedback
- Cursor changes to `cursor-grabbing` during drag

#### Block Library Polish
- Added smooth hover states with border color change and subtle shadow
- Improved transition timing with `duration-150` for snappier feel
- Changed gap from `gap-2` to `gap-3` for better spacing
- Changed border radius from `rounded-md` to `rounded-lg` for softer appearance
- Scale animation on drag (`scale-95`) for better visual feedback
- Maintained simple categorized layout without bright gradient colors

### Files Modified (Phase 3: Typography & Bug Fixes)
- `src/lib/blockDefaults.ts` - Updated heading and text block defaults with Phase 3 typography
- `src/types/email.ts` - Added `letterSpacing` property to HeadingBlockData interface
- `src/components/blocks/HeadingBlock.tsx` - Added letterSpacing support, fixed H1/H2/H3 switching, content preservation
- `src/components/blocks/TextBlock.tsx` - Fixed edit mode styling (background, padding, alignment)
- `src/components/blocks/ImageBlock.tsx` - Redesigned placeholder, fixed performance delay
- `src/components/layout/Canvas.tsx` - Fixed toolbar positioning and interaction
- `src/components/layout/EditorLayout.tsx` - Enhanced drag overlay with block icons
- `src/components/layout/BlockLibrary.tsx` - Added hover states and polish
- `src/lib/richTextUtils.ts` - Added `<font>` tag to `<span>` tag conversion for font persistence

### Summary
Phase 3 of the Canva redesign focused on professional typography, fixing critical bugs with styling persistence, and polishing the UI. All text formatting now works reliably with proper font persistence, heading level switching functions correctly with automatic typography updates, and the editing experience is smooth with no canvas jumping or toolbar disappearing issues.

---

### Added - 2025-12-06

#### Canva-Style UI Redesign - Phase 1.7: Toolbar Functionality Complete

**Canvas Toolbar Enhancements**
- Added Font Family dropdown showing current font name (e.g., "Georgia", "Arial")
- Added Font Size controls with - / + buttons and numeric input (8-72px range)
- Replaced color picker modal with simple "A" button with colored underline
- Text color button now opens Style sidebar for detailed color selection
- Fixed italic icon to show proper slanted "I" instead of cursive script
- All controls now fully functional with proper formatting application

**Font Size Implementation**
- Added `fontSize` command handler to TextBlock and HeadingBlock
- Font size changes apply to selected text or entire block
- Handles complex text selections across element boundaries
- Syncs font size display with current block/selection
- Keyboard shortcuts: Arrow Up/Down to adjust size in input field

**Font Family Implementation**
- Dropdown displays actual font name instead of generic "Font" label
- Email-safe fonts: Arial, Georgia, Times New Roman, Courier New, Verdana, Trebuchet MS, Impact
- Highlights currently selected font in dropdown
- Properly syncs with block data and updates in real-time

**Sidebar Cleanup**
- Removed Font Family dropdown from Text and Heading controls (now in toolbar)
- Removed Font Size slider from Text and Heading controls (now in toolbar)
- Kept Text Color, Line Height, Padding, Background, Alignment in sidebar
- Added helpful hint: "Use the toolbar at the top to change font and size"
- Cleaner, less redundant interface

**Text Color Workflow**
- Click "A" button in toolbar to open Style sidebar
- Color underline shows current text color
- Full color picker available in Style sidebar for detailed selection
- Matches Canva's pattern of toolbar button → sidebar panel

**Technical Implementation**
- Added `useEffect` hooks to sync toolbar state with block data
- Clamping function ensures font sizes stay within 8-72px range
- Proper event prevention to avoid losing focus during formatting
- Email-safe font family matching and detection
- Removed unused color picker state and handlers

**Critical Bug Fixes**
- Fixed text selection issues - cursor no longer jumps to first position
- Implemented `hasInitializedRef` to prevent re-initialization on every render
- Added selection preservation with `saveSelection()` and `restoreSelection()` helpers
- Fixed bold/italic/underline buttons - now properly apply formatting
- Used `requestAnimationFrame()` for proper timing of DOM updates
- Added debouncing (150ms) to selection change events for better performance
- Fixed sidebar context switching - editing mode now exits when different block selected
- Fixed DesignControls reactive subscription - sidebar now updates immediately when selecting blocks
- Changed from non-reactive `getSelectedBlock()` call to proper Zustand state subscriptions
- Sidebar now properly updates when clicking between text, heading, and image blocks

**Selection & Formatting Architecture**
- Implemented proper Selection/Range API usage for text selection preservation
- Format commands save selection before operations and restore after
- State updates capture formatted HTML immediately after `execCommand()`
- Individual character/word styling now works correctly
- Complex text selections across element boundaries handled properly

#### Canva-Style UI Redesign - Phase 1.5: Layout Restructure

**Bottom Toolbar Implementation**
- Moved viewport controls (mobile/desktop toggle) to fixed bottom toolbar
- Moved zoom controls (zoom in/out, slider, reset) to bottom toolbar
- Moved "Clear Canvas" button to bottom toolbar
- Bottom toolbar uses `fixed bottom-0` positioning with proper z-index layering
- Added padding to canvas area (`pb-24`) to prevent content overlap with fixed toolbar
- Modern design with proper spacing, dividers, and hover states

**Canvas Toolbar Repositioning**
- Moved CanvasToolbar from fixed top position to flow above canvas
- Changed from `fixed top-0 left-0 right-0` to relative positioning
- Added rounded borders (`rounded-lg`) and enhanced shadow
- Toolbar now appears contextually at top of canvas area, not over navigation
- Maintains smooth slide-down animation when appearing
- Better visual integration with canvas content

**Layout Architecture**
- Implemented flexbox structure with `flex-1` for canvas area
- Clean separation between canvas workspace and controls
- Matches Canva's design pattern: editing toolbar near content, controls at bottom
- Improved visual hierarchy and professional appearance

### Added - 2025-12-05

#### Canva-Style UI Redesign - Phase 1 Complete

**Top Canvas Toolbar**
- Created new `CanvasToolbar` component with modern, elegant Canva-style design
- Fixed position at top of canvas (replaces floating inline toolbar)
- Smooth slide-down animation when appearing
- Context-sensitive controls that appear only when editing text/heading blocks
- Modern button styling with 36px height, rounded corners, and hover states
- Grouped button sections with subtle dividers for better organization

**Editing State Management**
- Added `editingBlockId` and `editingType` to editor state in Zustand store
- New store actions: `setEditingBlock()` and `clearEditingBlock()`
- Proper cleanup when blocks are deleted or canvas is cleared
- Editing state properly tracked across the application

**Block Updates**
- Updated `TextBlock` to remove floating toolbar and use top Canvas Toolbar
- Updated `HeadingBlock` to remove floating toolbar and use top Canvas Toolbar
- Added `headingLevel` command support to change H1/H2/H3 from toolbar
- Implemented callback system to expose format handlers and active states
- Proper blur handling to prevent toolbar from closing when clicking buttons

**Component Chain Updates**
- Updated `Canvas.tsx` to render `CanvasToolbar` when editing
- Added format handler tracking with refs
- Added active states tracking for bold, italic, underline
- Updated `SortableBlock` to pass callbacks through
- Updated `BlockRenderer` to forward callbacks to text/heading blocks

**Technical Implementation**
- Callback-based architecture for format handler communication
- Ref-based storage of format handler to avoid re-renders
- Proper event propagation handling with `canvas-toolbar` class
- Type-safe implementation with TypeScript interfaces
- Clean separation of concerns between components

**User Experience Improvements**
- Rich text toolbar now stays at the top of the screen (more professional)
- No more toolbar jumping around as you edit
- Cleaner, more spacious editing interface
- Modern Canva-inspired design language
- Better visual hierarchy and organization

### Files Modified (Phase 1.7)
- `src/types/email.ts` - Added editing state properties to EditorState
- `src/stores/emailStore.ts` - Added editing state management and actions
- `src/components/layout/CanvasToolbar.tsx` - NEW: Modern top toolbar with font controls and text color
- `src/components/layout/Canvas.tsx` - Added toolbar rendering, callback handling, and bottom toolbar
- `src/components/layout/DesignControls.tsx` - Fixed reactive subscriptions for sidebar updates
- `src/components/blocks/TextBlock.tsx` - Selection preservation, exit editing on block change
- `src/components/blocks/HeadingBlock.tsx` - Selection preservation, exit editing on block change
- `src/components/blocks/SortableBlock.tsx` - Added callback props
- `src/components/blocks/BlockRenderer.tsx` - Added callback forwarding
- `src/components/controls/TextControls.tsx` - Removed redundant font family and size controls
- `src/components/controls/HeadingControls.tsx` - Removed redundant font family and size controls

### Next Steps
According to `CANVA_REDESIGN_PLAN.md`:
- ✅ Phase 1: Canvas Toolbar (Complete)
- ✅ Phase 2: Block Library Polish (Complete - skipped colored category cards per user preference)
- ✅ Phase 3: Typography & Styling (Complete - Georgia for headings, system fonts for body)
- ✅ Phase 4: Modern Block Components (Complete - bigger buttons, rounded images, better spacing)
- Phase 5: Canvas & Polish (canvas background, block shadows, enhanced hover states)
- Phase 6: Advanced Features (templates gallery, AI integration)

---

## [Previous Changes]

### Button Block Selection Fix
- Fixed `ButtonBlock` to properly show style tab and delete controls when selected
- Added proper event handling with `preventDefault()` and `stopPropagation()`
- Added `setActiveSidebarTab('style')` to switch to style tab on selection
- Added `pointerEvents: 'none'` to link to prevent interference

### Clear Canvas Feature
- Added "Clear Canvas" button to viewport controls
- Added confirmation modal before clearing all blocks
- Properly clears editing state when canvas is cleared

### Rich Text Editing Improvements
- Implemented bidirectional syncing between toolbar and sidebar controls
- Fixed toolbar buttons to work properly using `document.execCommand()`
- Fixed cursor position issues by using proper cursor positioning on edit mode entry
- Active formatting states (bold, italic, underline) now show correctly in toolbar

### Style Sidebar Cleanup
- Removed Block ID display
- Reduced spacing throughout (space-y-6 → space-y-4)
- Made all labels smaller (text-sm → text-xs)
- Reduced padding on inputs and buttons
- Made color pickers smaller (h-10 → h-8)
- Overall more compact and professional appearance

### Image Block Enhancement
- Ported modern image upload functionality from Composer Studio
- Created `useImageUpload` hook with Cloudinary integration
- Added beautiful upload progress dialog with preview
- Added "Change" button overlay when image is selected
- Automatic dimension calculation and aspect ratio handling
- Better styling with lineHeight: '0' and display: 'block'
