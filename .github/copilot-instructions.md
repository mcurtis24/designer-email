# GitHub Copilot Instructions for Designer Email

## Project Context
React + TypeScript email drag & drop editor using Vite, Zustand, Tailwind CSS, and @dnd-kit.

## Critical Workflow Rules

### 1. Always Read Before Editing
**NEVER edit a file without reading it first.** Match existing patterns and code style.

### 2. Restart Development Server After Major Changes
After adding features, packages, or making significant changes, **ALWAYS restart the server**:

```bash
npm run dev:all
```

This starts both:
- Vite dev server on http://localhost:5173/ (frontend)
- Express server on http://localhost:3002 (backend API)

**When to restart**:
- After adding npm packages
- After modifying server.js or vite.config.ts
- After changing environment variables
- After major feature additions
- When localhost:5173 doesn't show changes

### 3. Test Your Changes
Open http://localhost:5173/ in browser and test the feature. Check browser console for errors.

### 4. Follow Existing Patterns
Read similar files and match their structure, naming, and conventions.

## Architecture

### State Management: Zustand
```typescript
// ✅ CORRECT: Use Zustand store
import { useEmailStore } from '@/stores/emailStore'
const updateBlock = useEmailStore(state => state.updateBlock)

// ❌ WRONG: Don't create Context providers or Redux
```

### Block Pattern
Every block has these files:
1. Type in `src/types/email.ts` (extends BaseBlockData)
2. Defaults in `src/lib/blockDefaults.ts`
3. Component in `src/components/blocks/[BlockName].tsx`
4. Controls in `src/components/controls/[BlockName]Controls.tsx`
5. Registration in `BlockRenderer.tsx`

### Styling Rules
- Use Tailwind utilities for static styles
- Use inline styles for user-configurable values (colors, fontSize, padding)
- Follow Tailwind's spacing scale: gap-2, gap-4, gap-6, p-4, etc.

## TypeScript Requirements

- ✅ Use proper types (never 'any')
- ✅ Extend BaseBlockData for new block types
- ✅ Use discriminated unions for BlockData types
- ✅ Import types with `import type { ... }`

## Before Claiming a Task is Complete

- [ ] Read all relevant files first
- [ ] Follow existing code patterns
- [ ] Restart server with `npm run dev:all` if needed
- [ ] Test at http://localhost:5173/ in browser
- [ ] Check browser DevTools console for errors
- [ ] Verify TypeScript compiles: `npm run build`
- [ ] Verify no ESLint warnings

## Common Mistakes to Avoid

1. **Not restarting server** - Hot reload doesn't catch everything
2. **Not reading files first** - Leads to pattern mismatches
3. **Using 'any' types** - Always use proper TypeScript types
4. **Not testing in browser** - Code that compiles may not work correctly
5. **Breaking existing patterns** - Match what's already there

## File Organization

```
src/
├── components/
│   ├── blocks/          # Email blocks (TextBlock, ImageBlock, etc.)
│   ├── controls/        # Sidebar controls for styling blocks
│   └── layout/          # Layout components (Canvas, Toolbar, etc.)
├── stores/              # Zustand state management (emailStore.ts)
├── types/               # TypeScript type definitions (email.ts)
├── lib/                 # Utilities and block defaults
└── hooks/               # Custom React hooks
```

## Naming Conventions

- Components: PascalCase (`TextBlock.tsx`, `CanvasToolbar.tsx`)
- Types: PascalCase with suffix (`TextBlockData`, `BlockProps`)
- Functions: camelCase (`updateBlock`, `handleClick`)
- Files: Match component name exactly

## Import Order

1. React imports
2. External libraries
3. Internal stores/utilities
4. Types
5. Components

## Quick Reference

```bash
# Start development
npm run dev:all

# Type check
npm run build

# Check running servers
lsof -i :5173  # Frontend
lsof -i :3002  # Backend

# Install package
npm install <package-name>
```

## When Unsure

**Ask questions before implementing.** Better to clarify than implement incorrectly.

## Additional Resources

See `Planning and Updates/AI_CODING_INSTRUCTIONS.md` for detailed guidelines and examples.

---

**Follow these instructions for all code suggestions and implementations in this project.**
