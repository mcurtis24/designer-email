# Investigation & Fix Plan: Non-Selectable Spacer and Divider Blocks

## Investigation Summary

### Issue Description
After dragging Spacer and Divider blocks to the canvas, they cannot be selected (no blue ring appears on click).

### Root Causes Identified

#### SpacerBlock Issues
1. **Optional Props Issue**
   - `onClick?: () => void` was optional, but element tried to call it directly
   - `isSelected?: boolean` was optional, inconsistent with pattern
   - This violates TypeScript's contract and could cause undefined behavior

2. **Missing Event Handler Wrapping**
   - No `e.stopPropagation()` - click events bubble to parent
   - Parent elements might intercept clicks before SpacerBlock handler runs
   - No explicit click handler function

3. **Missing Accessibility Attributes**
   - No `tabIndex={0}` - not keyboard focusable
   - No `role="button"` - not semantic HTML
   - No `onKeyDown` handler - keyboard users can't interact
   - Missing `data-block-id` attribute

#### DividerBlock Issues
1. **Missing Event Handler Wrapping**
   - Original had direct `onClick={onClick}` without wrapping
   - No `e.stopPropagation()` in the handler
   - Otherwise had proper accessibility setup

### Working Blocks Pattern Analysis

Compared TextBlock, ImageBlock, and ButtonBlock:
- **All require** `onClick: () => void` (not optional)
- **All require** `isSelected: boolean` (not optional)  
- **All use** explicit click handlers with `e.stopPropagation()`
- **TextBlock/ImageBlock** have `min-h-[40px]` for minimum clickable area
- **All properly** handle click events before propagation

Spacer and Divider blocks diverged from this pattern.

## Solution Implemented

### File Changes Made

#### 1. src/components/blocks/SpacerBlock.tsx
**Changes:**
- Made `onClick` **required** (removed `?`)
- Made `isSelected` **required** (removed `?`)
- Added explicit `handleClick` function:
  ```typescript
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }
  ```
- Added `tabIndex={0}` for keyboard navigation
- Added `role="button"` for semantic HTML
- Added `onKeyDown` handler for Enter/Space key support
- Added `data-block-id={block.id}` attribute
- Updated ring styling to use `ring-offset-2` (consistent with divider)

**Result:** SpacerBlock now matches accessibility and event handling patterns of working blocks.

#### 2. src/components/blocks/DividerBlock.tsx  
**Changes:**
- Added explicit `handleClick` function with `e.stopPropagation()`
- Kept all existing accessibility attributes (already present)
- Already had `tabIndex={0}`, `role="button"`, `onKeyDown` handler

**Result:** DividerBlock now has consistent event handling pattern with SpacerBlock.

#### 3. src/components/blocks/BlockRenderer.tsx
**Changes:**
- Added `defaultClickHandler` constant for fallback
- Created `clickHandler = onClick || defaultClickHandler`
- Updated all block cases to use `clickHandler`
- Removed special `onClick || (() => {})` handling for divider

**Result:** All blocks receive a guaranteed click handler; no undefined calls possible.

## How It Works After Fix

1. **User clicks block on canvas**
   - Canvas component's `selectBlock(block.id)` is called via onClick

2. **Click propagates through layers**
   - SortableBlock receives click, passes onClick to BlockRenderer
   - BlockRenderer passes clickHandler to SpacerBlock/DividerBlock

3. **Block handles click**
   - SpacerBlock/DividerBlock's handleClick fires
   - `e.stopPropagation()` prevents bubbling to parent
   - `onClick()` callback executes, calling `selectBlock(block.id)`

4. **Store updates**
   - selectedBlockId is set in emailStore
   - Block's `isSelected` prop becomes true
   - Blue ring appears as visual feedback

5. **Keyboard support**
   - User can Tab to focus block (tabIndex={0})
   - Press Enter or Space to trigger onKeyDown handler
   - Same onClick() callback fires, selecting block

## Validation

### No Regressions
- Build compiles with no new TypeScript errors
- Existing 29 errors are pre-existing (unrelated files)
- Files changed: SpacerBlock.tsx, DividerBlock.tsx, BlockRenderer.tsx
- No errors or warnings in those files

### Consistency Improvements
- SpacerBlock now matches DividerBlock pattern
- DividerBlock now has explicit event handler like other blocks
- BlockRenderer now handles all blocks uniformly
- All blocks have required props (no optionals for critical handlers)

### Accessibility Improvements
- SpacerBlock now keyboard accessible (tabIndex + onKeyDown)
- SpacerBlock now semantic HTML (role="button")
- Both blocks have data-block-id for debugging
- Consistent with WCAG accessibility standards

## Testing Recommendations

### Manual Testing Steps
1. Create new email or open existing one
2. Drag Spacer block to canvas from right sidebar
3. Click on spacer block - verify blue ring appears
4. Click on divider block - verify blue ring appears
5. Tab through blocks - spacer should be focusable
6. When focused on spacer/divider, press Enter - should select
7. Verify sidebar updates to show selected block properties
8. Verify toolbar shows selection-related controls

### Edge Cases
- Click on Visual indicator text in spacer - should still select block
- Click near edge of spacer - should select
- Multiple rapid clicks - should not cause issues
- Tab navigation between blocks - should work smoothly
- Mobile viewport - should work if touch events are supported

### Regression Testing
- All other block types still selectable (Text, Heading, Image, Button, Gallery, Layout)
- Keyboard navigation still works for all blocks
- Block toolbar appears when block is selected
- Sidebar properly updates when switching between blocks
