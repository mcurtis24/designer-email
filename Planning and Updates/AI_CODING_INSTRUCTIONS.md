# AI Coding Instructions for Designer Email Project

This document provides comprehensive instructions for AI coding assistants (Copilot, Claude, etc.) working on the Designer Email project. Following these guidelines will ensure consistent, high-quality code that matches project standards.

## Critical Workflow Rules

### 1. Always Read Before Writing
**RULE**: Never edit a file without reading it first.
```
❌ BAD: Assume file structure and make changes
✅ GOOD: Read the file, understand the pattern, then make changes
```

**Why**: Ensures changes match existing code style, patterns, and architecture.

### 2. Server Restart After Major Changes
**RULE**: After making significant changes, explicitly restart the development server.

```bash
# Command to restart both servers
npm run dev:all
```

**When to restart**:
- After adding new npm packages
- After modifying server.js or vite.config.ts
- After changing environment variables
- After major feature additions
- When localhost:5173 isn't showing changes

**Why**: Vite's hot module reload doesn't catch everything. Copilot struggled with this.

### 3. Test Your Changes
**RULE**: After implementing a feature, test it in the browser.

```bash
# Check if servers are running
lsof -i :5173  # Vite dev server
lsof -i :3002  # Backend API server

# View the app
open http://localhost:5173/
```

### 4. Follow Existing Patterns
**RULE**: Match the coding patterns already used in the project.

**Example**: If all blocks use a specific prop structure, follow it:
```typescript
// Existing pattern in project
interface BlockProps {
  id: string
  data: BlockData
  isSelected: boolean
  onClick: () => void
}

// ✅ Follow this pattern for new blocks
// ❌ Don't create a different prop structure
```

## Architecture Understanding

### Project Structure
```
src/
├── components/
│   ├── blocks/          # Email blocks (TextBlock, ImageBlock, etc.)
│   ├── controls/        # Sidebar controls for blocks
│   └── layout/          # Layout components (Canvas, Toolbar, etc.)
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions and defaults
└── App.tsx              # Main application component
```

### State Management Pattern
**Technology**: Zustand (NOT Redux, NOT Context API)

```typescript
// ✅ CORRECT: Use Zustand store
import { useEmailStore } from '@/stores/emailStore'

function MyComponent() {
  const { blocks, addBlock, updateBlock } = useEmailStore()
  // ...
}

// ❌ WRONG: Don't create separate Context providers
```

### Block Architecture Pattern
Every block follows this pattern:

```typescript
// 1. Type definition in src/types/email.ts
export interface MyBlockData extends BaseBlockData {
  type: 'myblock'
  content: string
  // ... block-specific properties
}

// 2. Default values in src/lib/blockDefaults.ts
export const myBlockDefaults: Omit<MyBlockData, 'id'> = {
  type: 'myblock',
  content: '',
  // ... defaults
}

// 3. Component in src/components/blocks/MyBlock.tsx
export function MyBlock({ id, data, isSelected, onClick }: BlockProps) {
  const updateBlock = useEmailStore(state => state.updateBlock)
  // ... implementation
}

// 4. Controls in src/components/controls/MyBlockControls.tsx
export function MyBlockControls({ blockId }: { blockId: string }) {
  // ... controls for sidebar
}

// 5. Register in BlockRenderer.tsx
case 'myblock':
  return <MyBlock {...props} />
```

**ALWAYS follow this pattern** when creating new blocks.

## TypeScript Best Practices

### 1. Use Proper Types
```typescript
// ✅ GOOD: Proper typing
interface ButtonData {
  text: string
  url: string
  color: string
}

function updateButton(id: string, data: Partial<ButtonData>) {
  // ...
}

// ❌ BAD: Using 'any'
function updateButton(id: string, data: any) {
  // ...
}
```

### 2. Extend Existing Types
```typescript
// ✅ GOOD: Extend BaseBlockData
interface ImageBlockData extends BaseBlockData {
  type: 'image'
  src: string
}

// ❌ BAD: Redefine common properties
interface ImageBlockData {
  id: string  // Already in BaseBlockData!
  type: 'image'
  src: string
}
```

### 3. Use Discriminated Unions
```typescript
// ✅ GOOD: TypeScript can narrow types
type BlockData =
  | TextBlockData
  | ImageBlockData
  | ButtonBlockData

function render(block: BlockData) {
  if (block.type === 'text') {
    // TypeScript knows it's TextBlockData here
    console.log(block.text)
  }
}
```

## React Best Practices

### 1. Use Proper Hooks
```typescript
// ✅ GOOD: Zustand selector for performance
const updateBlock = useEmailStore(state => state.updateBlock)

// ❌ BAD: Getting entire store
const store = useEmailStore()
store.updateBlock()
```

### 2. Prevent Unnecessary Re-renders
```typescript
// ✅ GOOD: Memoize expensive components
const MemoizedGalleryImage = React.memo(GalleryImage)

// ✅ GOOD: Use useCallback for functions passed to children
const handleClick = useCallback(() => {
  updateBlock(id, { clicked: true })
}, [id, updateBlock])
```

### 3. Handle Events Properly
```typescript
// ✅ GOOD: Prevent event bubbling when needed
function handleClick(e: React.MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  // ... your logic
}

// ⚠️ BE CAREFUL: Only stop propagation when necessary
// Don't stop propagation on every click if not needed
```

## Styling Guidelines

### 1. Use Tailwind Utility Classes
```typescript
// ✅ GOOD: Tailwind utilities
<div className="flex items-center gap-2 p-4 rounded-lg hover:bg-gray-50">

// ❌ BAD: Inline styles for things Tailwind can do
<div style={{ display: 'flex', gap: '8px', padding: '16px' }}>
```

### 2. Use Inline Styles for Dynamic Values
```typescript
// ✅ GOOD: Inline styles for user-configurable values
<div style={{
  backgroundColor: data.backgroundColor,
  fontSize: data.fontSize,
  padding: `${data.padding.top}px ${data.padding.right}px ${data.padding.bottom}px ${data.padding.left}px`
}}>

// ❌ BAD: Hardcoded Tailwind classes for dynamic values
<div className="bg-blue-500 text-lg p-4">
```

### 3. Consistent Spacing Scale
Use Tailwind's spacing scale consistently:
- Small gaps: `gap-2` (8px)
- Medium gaps: `gap-4` (16px)
- Large gaps: `gap-6` (24px)
- Padding: `p-2`, `p-4`, `p-6`, etc.

## Common Patterns in This Project

### 1. Block Selection Pattern
```typescript
function MyBlock({ id, isSelected, onClick }: BlockProps) {
  return (
    <div
      onClick={onClick}
      className={isSelected ? 'ring-2 ring-blue-500' : ''}
    >
      {/* content */}
    </div>
  )
}
```

### 2. Block Update Pattern
```typescript
const updateBlock = useEmailStore(state => state.updateBlock)

function handleChange(newValue: string) {
  updateBlock(id, { content: newValue })
}
```

### 3. Sidebar Controls Pattern
```typescript
export function MyBlockControls({ blockId }: { blockId: string }) {
  const block = useEmailStore(state =>
    state.blocks.find(b => b.id === blockId)
  ) as MyBlockData | undefined

  const updateBlock = useEmailStore(state => state.updateBlock)

  if (!block) return null

  return (
    <div className="space-y-4">
      {/* controls */}
    </div>
  )
}
```

### 4. File Upload Pattern
Uses Cloudinary for image uploads:

```typescript
import { useImageUpload } from '@/hooks/useImageUpload'

function MyComponent() {
  const { uploadImage, isUploading, progress } = useImageUpload()

  const handleUpload = async (file: File) => {
    const result = await uploadImage(file)
    if (result.success) {
      // Use result.url
    }
  }
}
```

## Email HTML Generation

### Important: Email-Safe HTML
When generating HTML for emails, follow these rules:

```typescript
// ✅ GOOD: Inline styles only
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 16px; font-size: 16px;">
      Content
    </td>
  </tr>
</table>

// ❌ BAD: CSS classes (email clients strip them)
<div class="container">
  <p class="text-lg">Content</p>
</div>
```

### Email Template Structure
- Use `<table>` for layout (not flexbox/grid)
- All styles must be inline
- Use web-safe fonts
- Test in multiple email clients

## Testing Checklist

Before considering a feature complete:

- [ ] Code compiles without TypeScript errors (`npm run build`)
- [ ] Development server runs without errors (`npm run dev:all`)
- [ ] Feature works in browser at localhost:5173
- [ ] No console errors in browser DevTools
- [ ] Changes follow existing code patterns
- [ ] Types are properly defined
- [ ] No ESLint warnings (if applicable)
- [ ] Mobile viewport works (if UI changes)
- [ ] Desktop viewport works (if UI changes)

## Common Mistakes to Avoid

### 1. Not Restarting the Server
```bash
# ❌ MISTAKE: Assuming hot reload will catch everything
# Make changes → Wonder why it doesn't work → Get confused

# ✅ SOLUTION: Restart after major changes
npm run dev:all
```

### 2. Not Reading Files First
```typescript
// ❌ MISTAKE: Assume the file structure
// Edit without reading → Break existing patterns

// ✅ SOLUTION: Read first, understand, then edit
// 1. Read the file
// 2. Understand the pattern
// 3. Make changes that match
```

### 3. Breaking TypeScript Types
```typescript
// ❌ MISTAKE: Change interface without updating usages
interface BlockData {
  // content: string  // Removed this
  text: string       // Added this
}
// Now all components using 'content' are broken!

// ✅ SOLUTION: Update all usages or use migration strategy
// 1. Add new property
// 2. Update all usages
// 3. Remove old property
```

### 4. Not Testing in Browser
```bash
# ❌ MISTAKE: Assume code works because it compiles
# Write code → Commit → Never open browser

# ✅ SOLUTION: Always test visually
npm run dev:all
open http://localhost:5173/
# Actually click around and test the feature
```

## Debugging Tips

### Check if Servers are Running
```bash
# Check Vite dev server
lsof -i :5173

# Check backend API server
lsof -i :3002

# See all node processes
ps aux | grep node
```

### Check for TypeScript Errors
```bash
npm run build
```

### Check Console Logs
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed API requests
- React DevTools for component state

## Communication with User

When implementing features:

1. **Explain what you're doing**: Don't just write code silently
2. **Ask questions if unclear**: Better to ask than implement wrong
3. **Report what you tested**: Tell user you opened browser and tested
4. **Mention when you restart server**: Make it explicit
5. **Document breaking changes**: If you change an API, say so

## Examples of Good vs Bad Implementations

### Example 1: Adding a New Block Type

**❌ BAD Approach:**
```typescript
// Just create component without reading existing blocks
export function NewBlock() {
  return <div>New Block</div>
}
```

**✅ GOOD Approach:**
1. Read an existing block (e.g., TextBlock.tsx)
2. Copy its structure
3. Create type in email.ts
4. Create defaults in blockDefaults.ts
5. Create component following same pattern
6. Create controls following same pattern
7. Register in BlockRenderer.tsx
8. Test in browser

### Example 2: Fixing a Bug

**❌ BAD Approach:**
```typescript
// Make a guess and hope it works
data.fontSize = '16px'  // Might break things
```

**✅ GOOD Approach:**
1. Read the file to understand current implementation
2. Check type definitions
3. Understand why bug exists
4. Make targeted fix
5. Test the specific bug scenario
6. Make sure no regressions

### Example 3: Updating Styles

**❌ BAD Approach:**
```typescript
// Add random utility classes
<div className="mt-5 mb-3 px-7">
```

**✅ GOOD Approach:**
```typescript
// Use consistent spacing scale from project
<div className="mt-4 mb-4 px-6">  // Uses 4 (16px), 6 (24px)
```

## Project-Specific Conventions

### Naming Conventions
- Components: PascalCase (`TextBlock`, `CanvasToolbar`)
- Files: Match component name (`TextBlock.tsx`, `CanvasToolbar.tsx`)
- Types: PascalCase with descriptive suffix (`TextBlockData`, `BlockProps`)
- Functions: camelCase (`updateBlock`, `handleClick`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_FONT_SIZE`, `MAX_BLOCKS`)

### File Organization
- One component per file
- Co-locate types with components when specific to that component
- Shared types go in `src/types/email.ts`
- Utilities go in `src/lib/`
- Hooks go in `src/hooks/` (if you create any)

### Import Order
```typescript
// 1. React imports
import React, { useState, useCallback } from 'react'

// 2. External libraries
import { DndContext } from '@dnd-kit/core'

// 3. Internal utilities/stores
import { useEmailStore } from '@/stores/emailStore'
import { sanitizeEmailHTML } from '@/lib/richTextUtils'

// 4. Types
import type { TextBlockData } from '@/types/email'

// 5. Components
import { TextControls } from '@/components/controls/TextControls'
```

## Performance Considerations

### 1. Avoid Unnecessary Re-renders
```typescript
// ✅ GOOD: Select only what you need
const updateBlock = useEmailStore(state => state.updateBlock)

// ❌ BAD: Selecting entire array causes re-renders
const blocks = useEmailStore(state => state.blocks)
```

### 2. Memoize Heavy Components
```typescript
// ✅ GOOD: Memoize components that render frequently
const MemoizedBlock = React.memo(Block, (prev, next) => {
  return prev.id === next.id && prev.isSelected === next.isSelected
})
```

### 3. Debounce Expensive Operations
```typescript
// ✅ GOOD: Debounce text input
const debouncedUpdate = useMemo(
  () => debounce((value: string) => updateBlock(id, { text: value }), 300),
  [id, updateBlock]
)
```

## Summary: Key Takeaways for Copilot

1. **Always read before editing** - Don't assume file structure
2. **Restart server after major changes** - `npm run dev:all`
3. **Follow existing patterns** - Match what's already there
4. **Use proper TypeScript types** - No 'any' types
5. **Test in browser** - Don't just assume it works
6. **Use Zustand correctly** - Select only what you need
7. **Match project conventions** - Naming, structure, patterns
8. **Ask questions when unclear** - Better than wrong implementation
9. **Document what you do** - Help user understand changes
10. **Check for errors** - TypeScript, console, network

## Quick Reference Commands

```bash
# Start development servers
npm run dev:all

# Run TypeScript check
npm run build

# Check what's running on ports
lsof -i :5173  # Frontend
lsof -i :3002  # Backend

# Kill a process by PID
kill -9 <PID>

# Install new package
npm install <package-name>

# View recent git changes (if git initialized)
git diff
git status
```

---

**Last Updated**: 2025-12-08
**Project**: Designer Email - Drag & Drop Email Editor
**Target AI**: Copilot with Haiku 4.5, Claude Sonnet 4.5, or similar coding assistants
