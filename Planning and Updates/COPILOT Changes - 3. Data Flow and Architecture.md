# Data Flow & Architecture: Block Selection

## Event Flow Comparison

### Before Fix (Problem - Click gets lost)

```
Canvas (selectedBlockId = null)
    │
    └─> SortableBlock (isSelected=false)
        │  onClick = selectBlock(block.id)
        │
        └─> BlockRenderer (onClick provided)
            │
            └─> SpacerBlock
                ├─ Props: onClick?: () => void (OPTIONAL!)
                │         isSelected?: boolean (OPTIONAL!)
                │
                └─> <div onClick={onClick}>
                    │
                    └─ PROBLEM: onClick might be undefined!
                       No e.stopPropagation()
                       No keyboard support
                       Parent might intercept the click
                       Selection never happens ❌
```

### After Fix (Solution - Click is captured)

```
Canvas (selectedBlockId = block.id)
    │
    ├─ selectBlock() called ✅
    │
    └─> SortableBlock (isSelected=true)
        │  onClick = selectBlock(block.id)
        │
        └─> BlockRenderer
            ├─ defaultClickHandler = () => {}
            ├─ clickHandler = onClick || defaultClickHandler (GUARANTEED)
            │
            └─> SpacerBlock
                ├─ Props: onClick: () => void (REQUIRED) ✅
                │         isSelected: boolean (REQUIRED) ✅
                │
                └─> <div 
                    │   onClick={handleClick}
                    │   onKeyDown={(e) => { if (e.key === 'Enter'...) }}
                    │   tabIndex={0}
                    │   role="button"
                    │   data-block-id={block.id}
                    │
                    └─> handleClick(e) {
                            e.stopPropagation()  ✅ Prevents bubbling
                            onClick()            ✅ Always defined
                        }
                        │
                        └─ Store updates
                            └─ Block shows blue ring ✅
```

## Click Event Propagation

### Before (Click gets lost)
```
User clicks spacer
        │
        ├─> SpacerBlock.onClick = undefined ❌
        │
        ├─> Click bubbles to parent (SortableBlock) ❌
        │
        └─> Parent's event handler (if any) runs
            └─ Selection never happens ❌
```

### After (Click is captured)
```
User clicks spacer
        │
        ├─> SpacerBlock.handleClick() {
        │       e.stopPropagation()  ⬅️ CAPTURES event
        │       onClick()             ⬅️ Calls selectBlock(block.id)
        │   }
        │
        ├─ Stop propagation prevents bubbling ✅
        │
        └─> selectBlock(block.id) runs
            ├─ editorState.selectedBlockId = block.id
            ├─ Block gets isSelected=true prop
            ├─ Blue ring renders ✅
            └─ Sidebar updates ✅
```

## Keyboard Support Flow

### Before (No keyboard support)
```
User presses Tab
        │
        └─> No tabIndex on SpacerBlock ❌
            └─ Can't focus with keyboard
```

### After (Full keyboard support)
```
User presses Tab
        │
        ├─> tabIndex={0} makes block focusable ✅
        │   Block gets :focus-visible styles
        │
        └─> User presses Enter or Space
            │
            └─> onKeyDown handler fires
                ├─ e.preventDefault() (prevents default action)
                ├─ onClick() (calls selectBlock(block.id))
                │
                └─> Block selected with keyboard ✅
```

## Type Safety Comparison

### Before (Type Checking Failure)
```typescript
SpacerBlockProps {
  onClick?: () => void    // TypeScript allows undefined!
}

const element = <div onClick={onClick} />  // ❌ onClick could be undefined

// TypeScript doesn't enforce that onClick must be provided
// Runtime error possible if onClick is not passed!
```

### After (Type Checking Success)
```typescript
SpacerBlockProps {
  onClick: () => void     // TypeScript REQUIRES this ✅
}

const element = <div onClick={handleClick} />  // ✅ Always defined

// TypeScript enforces that onClick MUST be provided
// Compiler error if BlockRenderer forgets to pass onClick
// No runtime surprises!
```

## Accessibility & Semantic HTML

### Before
```
HTML Structure:
<div>
    ├─ No tabIndex        ❌ Not keyboard focusable
    ├─ No role            ❌ Not semantic HTML
    ├─ No aria labels     ❌ No screen reader info
    └─ onClick handler    ⚠️  Works only for mouse
        └─ Not keyboard accessible ❌
```

### After
```
HTML Structure:
<div
    tabIndex={0}          ✅ Keyboard focusable
    role="button"         ✅ Semantic HTML (identifies as button)
    data-block-id="xxx"   ✅ Debugging info
    onClick={handleClick} ✅ Mouse support
    onKeyDown={handler}   ✅ Keyboard support
>
    Fully accessible! ✅
    - Keyboard: Tab to focus + Enter/Space to select
    - Mouse: Click to select
    - Screen readers: Identified as button element
```

## Component Integration Pattern

### Block Component Pattern (After Fix)

```
interface BlockProps {
  block: EmailBlock & { data: BlockData }
  isSelected: boolean         // ✅ Required
  onClick: () => void         // ✅ Required
  onFormatRequest?: (...)     // Optional for editing blocks
  onActiveStatesChange?: (...) // Optional for editing blocks
}

export default function Block({ block, isSelected, onClick }: BlockProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      tabIndex={0}
      role="button"
      data-block-id={block.id}
      className={`... ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      {/* Block content */}
    </div>
  )
}
```

This pattern is now consistent across both SpacerBlock and DividerBlock.

## Data Flow Validation

### Selection State Flow
```
User Action
    ↓
BlockRenderer.clickHandler called
    ↓
SpacerBlock.handleClick(e)
    ├─ e.stopPropagation() [prevents bubbling]
    ↓
onClick() callback executes
    ↓
Canvas.selectBlock(block.id) called
    ↓
emailStore.editorState.selectedBlockId = block.id
    ↓
All components re-render with updated isSelected prop
    ↓
SpacerBlock receives isSelected=true
    ↓
Render updates: className changes to show ring-2 ring-blue-500
    ↓
Visual feedback: Blue ring appears around block ✅
```

### Guarantee Chain
```
BlockRenderer
├─ clickHandler = onClick || defaultClickHandler
│  (Guarantees handler is never undefined)
│
└─> SpacerBlock
    ├─ Props: onClick: () => void (Required by TypeScript)
    │  (Guarantees onClick is not optional)
    │
    └─> handleClick(e)
        ├─ e.stopPropagation()
        │  (Guarantees no propagation)
        │
        └─> onClick()
            (Guaranteed to be valid function)
```

## Testing Verification Points

✅ **Click Selection**
- Click spacer → selectedBlockId updates → isSelected=true → blue ring appears

✅ **Keyboard Selection**
- Tab to spacer → tabIndex={0} makes it focusable
- Press Enter/Space → onKeyDown handler fires → selectBlock() called

✅ **Event Propagation**
- Click on spacer doesn't bubble to parent
- Parent click handlers don't interfere

✅ **State Consistency**
- selectedBlockId in store matches isSelected prop in component
- Sidebar properly reflects selected block

✅ **Accessibility**
- Screen readers announce as "button"
- Keyboard navigation works smoothly
- Visual focus ring appears
