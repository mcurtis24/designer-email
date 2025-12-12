# Implementation Plan: Add Line Height & Background Color to Divider Block

## Overview
Enhance the Divider block to support `lineHeight` and `backgroundColor` properties, giving users more design control similar to the Heading block. This will improve visual design flexibility for dividers.

## Current State Analysis

### Divider Block - Current Data Structure
```typescript
export interface DividerBlockData {
  color: string
  thickness: number // px
  style: 'solid' | 'dashed' | 'dotted'
  width?: string // e.g., '100%', '50%', '300px'
  padding?: string // e.g., '16px 0'
}
```

**Missing:**
- `lineHeight: number` - Control spacing around the line
- No background color support

### Heading Block - Reference Pattern
```typescript
export interface HeadingBlockData {
  level: 1 | 2 | 3
  text: string
  fontFamily: string
  fontSize: string
  fontWeight: number
  color: string
  lineHeight: number        // ✅ Has this
  letterSpacing?: string
}
```

**Also uses block.styles.backgroundColor** for background color control

### DividerControls - Current Implementation
```typescript
// Currently has:
- Line Style (solid/dashed/dotted)
- Line Color (with ColorThemePicker)
- Line Thickness (px)
- Line Width (%)
- Spacing (Top/Bottom) - but uses padding string
- Visual Preview

// Missing:
- Line Height control
- Background Color control
```

## Implementation Plan

### Phase 1: Update Type Definitions

**File:** `src/types/email.ts`

**Change DividerBlockData interface:**
```typescript
export interface DividerBlockData {
  color: string
  thickness: number
  style: 'solid' | 'dashed' | 'dotted'
  width?: string
  padding?: string
  lineHeight?: number        // NEW - defaults to 1
}
```

**Why this approach:**
- Keep background color in `block.styles.backgroundColor` (consistent with other blocks)
- Add `lineHeight` to data (consistent with HeadingBlock)
- Use optional `?` for backward compatibility with existing dividers
- Default to 1 if not specified

### Phase 2: Update DividerBlock Component

**File:** `src/components/blocks/DividerBlock.tsx`

**Changes needed:**
1. Use `styles.backgroundColor` from block.styles
2. Apply `lineHeight` to container div styling
3. Maintain existing functionality

**Example:**
```typescript
export default function DividerBlock({ block, isSelected, onClick }: DividerBlockProps) {
  const data = block.data as DividerBlockData
  const { styles } = block

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
      className={`w-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{
        padding: data.padding || '16px 0',
        minHeight: '24px',
        backgroundColor: styles.backgroundColor,  // NEW
        lineHeight: data.lineHeight ? `${data.lineHeight}` : '1',  // NEW
      }}
    >
      <hr style={{ ... }} />
    </div>
  )
}
```

### Phase 3: Update DividerControls Component

**File:** `src/components/controls/DividerControls.tsx`

**Add two new sections before Visual Preview:**

#### 1. Background Color Control
```typescript
{/* Background Color */}
<ColorThemePicker
  label="Background Color"
  value={block.styles.backgroundColor || '#ffffff'}
  onChange={(color) => updateBlock(block.id, {
    styles: {
      ...block.styles,
      backgroundColor: color,
    },
  })}
  documentColors={documentColors}
  brandColors={brandColors}
  onAddBrandColor={addBrandColor}
  onRemoveBrandColor={removeBrandColor}
/>
```

#### 2. Line Height Control
```typescript
{/* Line Height */}
<div>
  <label className="block text-xs font-medium text-gray-700 mb-1.5">
    Line Height
  </label>
  <input
    type="number"
    step="0.1"
    min="1"
    max="3"
    value={data.lineHeight || 1}
    onChange={(e) => handleDataChange('lineHeight', parseFloat(e.target.value))}
    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
  />
</div>
```

**Placement in component:**
1. Line Style (existing)
2. Line Color (existing)
3. Line Thickness (existing)
4. Line Width (existing)
5. Spacing/Padding (existing)
6. **Background Color (NEW) ← Add here**
7. **Line Height (NEW) ← Add here**
8. Visual Preview (existing)

### Phase 4: Update Visual Preview

**File:** `src/components/controls/DividerControls.tsx` - Preview section

**Current preview code needs to add background color and line height:**

```typescript
{/* Visual Preview */}
<div>
  <label className="block text-xs font-medium text-gray-700 mb-2">
    Preview
  </label>
  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
    <div 
      style={{ 
        padding: data.padding || '16px 0',
        backgroundColor: block.styles.backgroundColor,  // NEW
        lineHeight: data.lineHeight ? `${data.lineHeight}` : '1',  // NEW
      }}
    >
      <hr
        style={{
          width: data.width || '100%',
          height: '0',
          border: 'none',
          borderTop: `${data.thickness || 1}px ${data.style || 'solid'} ${
            data.color || '#e5e7eb'
          }`,
          margin: '0 auto',
          padding: '0',
        }}
      />
    </div>
  </div>
</div>
```

## Files Modified Summary

| File | Changes | Purpose |
|------|---------|---------|
| `src/types/email.ts` | Add `lineHeight?: number` to DividerBlockData | Type definition for new property |
| `src/components/blocks/DividerBlock.tsx` | Use backgroundColor and lineHeight in styles | Apply new properties to rendered block |
| `src/components/controls/DividerControls.tsx` | Add ColorThemePicker for background + Line Height input + Update preview | UI controls for new properties |

## Implementation Order

1. **Step 1:** Update `DividerBlockData` type in `src/types/email.ts`
   - Add `lineHeight?: number` property
   
2. **Step 2:** Update `DividerBlock.tsx` component
   - Add backgroundColor and lineHeight to div styles
   - Ensure backward compatibility with default values
   
3. **Step 3:** Update `DividerControls.tsx` sidebar
   - Add Background Color ColorThemePicker
   - Add Line Height number input
   - Update preview to show both new properties
   - Maintain existing controls order

## Testing Strategy

### Manual Testing
1. **Backward Compatibility:**
   - Existing dividers without lineHeight should still work
   - Default lineHeight should be 1
   
2. **Background Color:**
   - Open existing divider block
   - Go to Style sidebar
   - Set background color
   - Verify color appears in canvas
   - Verify color persists on save/reload
   
3. **Line Height:**
   - Set line height to 1, 1.5, 2, 2.5, 3
   - Verify spacing around divider increases
   - Verify preview updates in real-time
   
4. **Combination:**
   - Set both background color AND line height
   - Verify both properties work together
   - Preview updates correctly
   
5. **Reset/Default:**
   - Create new divider
   - Verify defaults work (lineHeight=1, backgroundColor=transparent)
   - Verify preview looks correct

### Edge Cases
- Very small lineHeight (1.0)
- Very large lineHeight (3.0)
- Transparent background
- Background same color as line
- Different combinations with padding

## Benefits

✅ **Consistency:** Dividers now support same style properties as headings
✅ **Flexibility:** More design control for divider styling
✅ **User Experience:** Familiar controls (same pattern as HeadingControls)
✅ **Visual Design:** Better spacing and separation with line height
✅ **Customization:** Can create themed dividers with background colors

## Design Notes

### Line Height Interpretation
For dividers, `lineHeight` primarily controls the vertical spacing around the line itself:
- lineHeight: 1 = minimal space (tight)
- lineHeight: 1.5 = moderate space
- lineHeight: 2 = double space (relaxed)
- lineHeight: 3 = maximum space (very relaxed)

This is different from text, where it controls line spacing within paragraphs.

### Background Color Use Cases
- Add subtle background to highlight section breaks
- Create colored dividers with background for visual emphasis
- Group related content with background-colored dividers

## Backward Compatibility

- ✅ Existing dividers without lineHeight will default to 1
- ✅ Optional chaining `data.lineHeight || 1` ensures no errors
- ✅ ColorThemePicker defaults to white if no backgroundColor set
- ✅ No breaking changes to DividerBlockData interface

## Possible Future Enhancements

1. Add margin controls (top/bottom margins, not just padding)
2. Add border radius for decorative dividers
3. Add shadow effects
4. Add gradient backgrounds for dividers
5. Add multiple line styles (e.g., wavy, zigzag)
