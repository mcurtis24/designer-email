# Quick Instructions for Copilot Chat

Copy and paste this into Copilot chat at the start of each session:

---

## Context: Designer Email Project

You're working on a React + TypeScript email editor using Vite, Zustand, Tailwind, and @dnd-kit.

## Critical Rules

1. **ALWAYS read files before editing them** - Never assume structure
2. **Restart server after major changes**: Run `npm run dev:all`
3. **Test in browser** at http://localhost:5173/ after implementing
4. **Follow existing patterns** - Read similar files and match their style
5. **Use proper TypeScript types** - No 'any' types

## Architecture Patterns

**State Management**: Zustand (in `src/stores/emailStore.ts`)
```typescript
const updateBlock = useEmailStore(state => state.updateBlock)
```

**Block Structure**: Every block has:
- Type definition in `src/types/email.ts`
- Defaults in `src/lib/blockDefaults.ts`
- Component in `src/components/blocks/[BlockName].tsx`
- Controls in `src/components/controls/[BlockName]Controls.tsx`
- Registration in `BlockRenderer.tsx`

**Styling**:
- Tailwind utilities for static styles
- Inline styles for user-configurable values (colors, fonts, spacing)

## Common Commands

```bash
npm run dev:all          # Start both servers (5173 + 3002)
npm run build            # Check TypeScript errors
lsof -i :5173            # Check if Vite is running
lsof -i :3002            # Check if backend is running
```

## Before Completing Any Task

- [ ] Read relevant files first
- [ ] Make changes following existing patterns
- [ ] Run `npm run dev:all` if needed
- [ ] Test in browser at localhost:5173
- [ ] Check browser console for errors
- [ ] Verify TypeScript compiles: `npm run build`

## When You're Unsure

ASK before implementing. Better to clarify than implement incorrectly.

---

Use this context for all your responses in this project.
