# Divider Enhancement - Implementation Code Reference

## File 1: Update Type Definition

**Path:** `src/types/email.ts`

### BEFORE
```typescript
export interface DividerBlockData {
  color: string
  thickness: number // px
  style: 'solid' | 'dashed' | 'dotted'
  width?: string // e.g., '100%', '50%', '300px'
  padding?: string // e.g., '16px 0'
}
```

### AFTER
```typescript
export interface DividerBlockData {
  color: string
  thickness: number // px
  style: 'solid' | 'dashed' | 'dotted'
  width?: string // e.g., '100%', '50%', '300px'
  padding?: string // e.g., '16px 0'
  lineHeight?: number // spacing around divider (1-3)
}
```

**Change Summary:**
- Add one new optional property: `lineHeight?: number`
- Default is 1 (no extra spacing)
- Range: 1-3 (similar to HeadingBlock)

---

## File 2: Update DividerBlock Component

**Path:** `src/components/blocks/DividerBlock.tsx`

### Current Implementation
```typescript
import type { EmailBlock, DividerBlockData } from '@/types/email'

interface DividerBlockProps {
  block: EmailBlock & { data: DividerBlockData }
  isSelected: boolean
  onClick: () => void
}

export default function DividerBlock({ block, isSelected, onClick }: DividerBlockProps) {
  const data = block.data as DividerBlockData

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
          margin: '0',
          padding: '0',
        }}
      />
    </div>
  )
}
```

### Updated Implementation
```typescript
import type { EmailBlock, DividerBlockData } from '@/types/email'

interface DividerBlockProps {
  block: EmailBlock & { data: DividerBlockData }
  isSelected: boolean
  onClick: () => void
}

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
        backgroundColor: styles.backgroundColor,
        lineHeight: data.lineHeight ? `${data.lineHeight}` : '1',
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
          margin: '0',
          padding: '0',
        }}
      />
    </div>
  )
}
```

**Changes Made:**
1. Added `const { styles } = block` to access block styles
2. Added `backgroundColor: styles.backgroundColor` to style object
3. Added `lineHeight: data.lineHeight ? \`${data.lineHeight}\` : '1'` to style object

---

## File 3: Update DividerControls Component

**Path:** `src/components/controls/DividerControls.tsx`

### Current Section to Locate
```typescript
return (
  <div className="space-y-4">
    {/* Line Style */}
    ...
    {/* Line Color */}
    ...
    {/* Line Thickness */}
    ...
    {/* Line Width */}
    ...
    {/* Padding */}
    ...
    {/* Visual Preview */}
    ...
  </div>
)
```

### New Sections to Add (Before "Visual Preview")

#### 1. Add Background Color Control
Insert after the Padding section and before Visual Preview:

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

### Updated Visual Preview Section

**Current:**
```typescript
      {/* Visual Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div style={{ padding: data.padding || '16px 0' }}>
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

**Updated:**
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
              backgroundColor: block.styles.backgroundColor,
              lineHeight: data.lineHeight ? `${data.lineHeight}` : '1',
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

**Changes Made:**
1. Updated preview div style to include `backgroundColor: block.styles.backgroundColor`
2. Updated preview div style to include `lineHeight: data.lineHeight ? \`${data.lineHeight}\` : '1'`

---

## Complete Updated DividerControls.tsx

```typescript
/**
 * Divider Block Controls
 * Properties specific to divider blocks
 */

import { useMemo } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, DividerBlockData } from '@/types/email'
import { ColorThemePicker } from '@/components/ui/ColorThemePicker'
import { extractDocumentColors } from '@/lib/colorUtils'

interface DividerControlsProps {
  block: EmailBlock & { data: DividerBlockData }
}

export default function DividerControls({ block }: DividerControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const addBrandColor = useEmailStore((state) => state.addBrandColor)
  const removeBrandColor = useEmailStore((state) => state.removeBrandColor)
  const blocks = useEmailStore((state) => state.email.blocks)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const data = block.data as DividerBlockData

  // Extract document colors from all blocks
  const documentColors = useMemo(() => extractDocumentColors(blocks), [blocks])

  const handleDataChange = (field: keyof DividerBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Line Style */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Line Style
        </label>
        <div className="flex gap-2">
          {(['solid', 'dashed', 'dotted'] as const).map((style) => (
            <button
              key={style}
              onClick={() => handleDataChange('style', style)}
              className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all capitalize ${
                data.style === style
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Line Color */}
      <ColorThemePicker
        label="Line Color"
        value={data.color}
        onChange={(color) => handleDataChange('color', color)}
        documentColors={documentColors}
        brandColors={brandColors}
        onAddBrandColor={addBrandColor}
        onRemoveBrandColor={removeBrandColor}
      />

      {/* Line Thickness */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Line Thickness (px)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="1"
            max="10"
            value={data.thickness}
            onChange={(e) => handleDataChange('thickness', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={data.thickness}
            onChange={(e) => handleDataChange('thickness', parseInt(e.target.value))}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="1"
            max="10"
          />
        </div>
      </div>

      {/* Line Width */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Line Width
        </label>
        <div className="flex gap-2">
          <select
            value={data.width || '100%'}
            onChange={(e) => handleDataChange('width', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="100%">Full Width (100%)</option>
            <option value="75%">75%</option>
            <option value="50%">50%</option>
            <option value="25%">25%</option>
          </select>
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Spacing (Top/Bottom)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="64"
            step="4"
            value={parseInt(data.padding?.split(' ')[0] || '16')}
            onChange={(e) => handleDataChange('padding', `${e.target.value}px 0`)}
            className="flex-1"
          />
          <input
            type="number"
            value={parseInt(data.padding?.split(' ')[0] || '16')}
            onChange={(e) => handleDataChange('padding', `${e.target.value}px 0`)}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            min="0"
            max="64"
            step="4"
          />
        </div>
      </div>

      {/* Background Color - NEW */}
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

      {/* Line Height - NEW */}
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

      {/* Visual Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div 
            style={{ 
              padding: data.padding || '16px 0',
              backgroundColor: block.styles.backgroundColor,
              lineHeight: data.lineHeight ? `${data.lineHeight}` : '1',
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
    </div>
  )
}
```

---

## Line-by-Line Changes Summary

### src/types/email.ts
- **Line to add:** `lineHeight?: number` after padding property

### src/components/blocks/DividerBlock.tsx
- **Line to add (import section):** Add `const { styles } = block`
- **Lines to add (style object):** 
  - `backgroundColor: styles.backgroundColor,`
  - `lineHeight: data.lineHeight ? \`${data.lineHeight}\` : '1',`

### src/components/controls/DividerControls.tsx
- **Lines to add (after Padding section):**
  - Background Color ColorThemePicker (9 lines)
  - Line Height input (10 lines)
- **Lines to modify (Visual Preview):**
  - Update div style object to include backgroundColor and lineHeight

**Total Changes:**
- ~3 lines in types file
- ~3 lines in DividerBlock component
- ~20 lines in DividerControls component
- Net addition: ~26 lines of code
