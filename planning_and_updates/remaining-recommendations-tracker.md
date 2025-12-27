# Remaining Recommendations Tracker

**Purpose:** Track all technical and UX recommendations from comprehensive reviews to ensure nothing is forgotten.

**Status:** Updated December 26, 2025

---

## Phase 1: Immediate (Week 1-2) - IN PROGRESS

### Style Tab Restructure (THIS WEEK)
**Timeline:** 3-5 days development + 2-3 days testing
**Status:** Starting implementation

#### Implementation Tasks
- [x] Create comprehensive plan
- [x] Get code review
- [x] Get design review
- [ ] Create CollapsibleSection component with persistent state
- [ ] Create shared control components (ColorControl, FontControl, SizeControl, AlignmentControl, PaddingControl)
- [ ] Refactor DesignControls.tsx structure
- [ ] Remove QuickApplyToolbar
- [ ] Migrate HeadingControls to section-based structure
- [ ] Migrate TextControls to section-based structure
- [ ] Migrate ButtonControls to section-based structure
- [ ] Migrate ImageControls to section-based structure
- [ ] Implement mobile override UI (blue background, side-by-side display)
- [ ] Add Brand Styles section
- [ ] Comprehensive testing checklist
- [ ] Staging deployment
- [ ] Production deployment

---

## Phase 2: Technical Debt from Code-Reviewer (Week 3-10)

### HIGH PRIORITY: Address After Style Tab Launch

#### 1. State Management Refinement (Week 3-4, 3-5 days)
**Issue:** CollapsibleSection uses local state, will lose state on re-renders
**Impact:** User frustration when section states reset
**Solution Required:**
```typescript
// Add to emailStore.ts
interface UIState {
  collapsedSections: {
    [blockType: string]: Set<string>
  }
}

setSectionState: (blockType: string, section: string, isOpen: boolean) => void
```

**Files to Modify:**
- `/src/stores/emailStore.ts` - Add UI state slice
- `/src/components/ui/CollapsibleSection.tsx` - Use store state instead of local
- All control components - Integrate with persistent state

**Acceptance Criteria:**
- [ ] Section states persist when switching blocks
- [ ] Responsive section auto-expands when mobile mode active
- [ ] User preferences saved to localStorage

---

#### 2. Component Architecture Cleanup (Week 5, 2-3 days)
**Issue:** Using render functions instead of proper React components
**Impact:** Can't use hooks properly, harder to memoize, breaks DevTools
**Solution Required:**
```typescript
// Instead of:
export function renderHeadingAppearance(block: EmailBlock) { }

// Do:
export const HeadingAppearanceControls = React.memo(({ block, onUpdate }) => { })
```

**Files to Refactor:**
- `/src/components/controls/HeadingControls.tsx`
- `/src/components/controls/TextControls.tsx`
- `/src/components/controls/ButtonControls.tsx`
- `/src/components/controls/ImageControls.tsx`
- All other control components

**Acceptance Criteria:**
- [ ] All control sections are proper React components
- [ ] Can use hooks without issues
- [ ] React DevTools shows component tree clearly
- [ ] Proper displayName for debugging

---

#### 3. Type Safety Improvements (Week 5-6, 2-3 days)
**Issue:** Multiple `any` types, unsafe type assertions
**Impact:** Runtime errors possible, TypeScript benefits lost
**Solution Required:**
```typescript
// Remove all 'any' types
interface MobileOverrideControlProps<T> {
  value: T
  onChange: (value: T) => void
}

// Use type guards instead of assertions
if (isHeadingBlock(block)) {
  // TypeScript knows block.data is HeadingBlockData
}
```

**Files to Audit:**
- All control components
- Shared control components
- DesignControls.tsx
- emailStore.ts update functions

**Acceptance Criteria:**
- [ ] Zero `any` types in Style Tab code
- [ ] All type assertions replaced with type guards
- [ ] Generic types used for reusable controls
- [ ] TypeScript strict mode enabled (if not already)

---

### MEDIUM PRIORITY: Performance Optimization (Week 7-8)

#### 4. Store Splitting (5-7 days)
**Issue:** Monolithic 1,468-line store causes unnecessary re-renders
**Impact:** Performance degradation with large emails (theoretical, not observed)
**Solution Required:**
```typescript
// Split into:
/stores
  /emailStore.ts       // Email document, blocks, settings
  /editorStore.ts      // UI state, selection, viewport
  /historyStore.ts     // Undo/redo, versioning
  /templateStore.ts    // User templates, saved components
  /uiStore.ts          // Sidebar tabs, modals, section states
```

**Files to Create/Modify:**
- Create 5 separate store files
- Update all components to use appropriate stores
- Migrate state slices
- Test undo/redo still works
- Test history buffer still works

**Acceptance Criteria:**
- [ ] Store split into 5 logical modules
- [ ] Components subscribe to minimal state slices
- [ ] No breaking changes to existing functionality
- [ ] Performance improvement measurable (>20% fewer re-renders)

---

#### 5. Re-render Optimization (3-4 days)
**Issue:** Unnecessary re-renders from broad store subscriptions
**Impact:** Minor performance impact, mostly theoretical
**Solution Required:**
```typescript
// Create stable selectors
const selectBrandColors = (state: EmailStore) => state.email.settings.brandColors

// Use React.memo with proper comparison
export const ColorControl = React.memo<ColorControlProps>(
  ({ label, value, onChange }) => { },
  (prev, next) => prev.value === next.value && prev.brandColors === next.brandColors
)

// Use useCallback for handlers
const handleChange = useCallback((color: string) => {
  onChange(color)
}, [onChange])
```

**Files to Optimize:**
- All shared control components
- HeadingControls, TextControls, etc.
- BlockRenderer components
- SortableBlock component

**Acceptance Criteria:**
- [ ] React DevTools Profiler shows <50ms update times
- [ ] No cascading re-renders when updating single block
- [ ] Proper memoization strategy documented
- [ ] Performance benchmarks recorded (before/after)

---

#### 6. Structural Sharing in Block Updates (2-3 days)
**Issue:** `updateBlock` creates new references for all parent blocks even when unchanged
**Impact:** Unnecessary re-renders up the tree
**Solution Required:**
```typescript
const updateBlockRecursive = (block: EmailBlock): EmailBlock => {
  if (block.id === blockId) return { ...block, ...updates }

  if (isLayoutBlock(block)) {
    const updatedChildren = block.data.children.map(updateBlockRecursive)

    // Only create new block if children actually changed
    const hasChanged = updatedChildren.some(
      (child, i) => child !== block.data.children[i]
    )

    if (!hasChanged) return block // Return same reference

    return { ...block, data: { ...block.data, children: updatedChildren } }
  }

  return block
}
```

**Files to Modify:**
- `/src/stores/emailStore.ts` - updateBlock function

**Acceptance Criteria:**
- [ ] Unchanged blocks return same reference
- [ ] React.memo works correctly with structural sharing
- [ ] No breaking changes to update logic

---

### LOW PRIORITY: Polish & Testing (Week 9-10)

#### 7. ContentEditable Custom Hook (2-3 days)
**Issue:** Selection management duplicated in HeadingBlock and TextBlock
**Impact:** Maintainability, potential race conditions
**Solution Required:**
```typescript
// Create /src/hooks/useContentEditable.ts
export function useContentEditable(contentRef, onUpdate) {
  const saveSelection = useCallback(() => { }, [contentRef])
  const restoreSelection = useCallback((saved) => { }, [contentRef])
  const handleFormat = useCallback((command, value) => { }, [])

  return { saveSelection, restoreSelection, handleFormat }
}
```

**Files to Refactor:**
- Create `/src/hooks/useContentEditable.ts`
- `/src/components/blocks/HeadingBlock.tsx` - Use hook
- `/src/components/blocks/TextBlock.tsx` - Use hook

**Acceptance Criteria:**
- [ ] No code duplication between HeadingBlock and TextBlock
- [ ] Selection management works identically
- [ ] Cursor position preserved correctly
- [ ] No race conditions

---

#### 8. Error Handling & Loading States (2-3 days)
**Issue:** Silent failures, no user feedback for async operations
**Impact:** Poor UX when operations fail
**Solution Required:**
```typescript
import toast from 'react-hot-toast'

try {
  localStorage.setItem(key, value)
  toast.success('Saved successfully')
} catch (error) {
  console.error('Storage error:', error)
  toast.error('Failed to save. Storage quota may be full.')
}

// Add loading states
interface EmailStore {
  isGeneratingThumbnail: boolean
  isSavingTemplate: boolean
}
```

**Files to Modify:**
- All localStorage operations in emailStore.ts
- Template save operations
- Component save operations
- Add react-hot-toast library

**Acceptance Criteria:**
- [ ] All errors shown to user with toast notifications
- [ ] Loading spinners for async operations
- [ ] Clear error messages with actionable guidance
- [ ] Storage quota monitoring implemented

---

#### 9. LocalStorage Quota Management (1-2 days)
**Issue:** Templates can exceed 5MB quota, thumbnails are base64 PNGs
**Impact:** Save failures when quota exceeded
**Solution Required:**
```typescript
// Compress thumbnails
- Use WebP instead of PNG
- Reduce quality to 80%
- Store in IndexedDB instead of localStorage

// Monitor quota
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate()
  const usagePercent = (estimate.usage! / estimate.quota!) * 100

  if (usagePercent > 80) {
    toast.warning('Storage nearly full. Consider deleting old templates.')
  }
}
```

**Files to Modify:**
- `/src/stores/emailStore.ts` - saveEmailAsTemplate
- Add storage monitoring utility
- Implement IndexedDB fallback

**Acceptance Criteria:**
- [ ] Storage quota monitored and reported to user
- [ ] Thumbnails compressed (WebP, 80% quality)
- [ ] Graceful degradation when quota exceeded
- [ ] Option to delete old templates

---

#### 10. Unit Test Coverage (Ongoing, 5-10 days total)
**Issue:** No test coverage currently
**Impact:** Less confidence in refactoring, regression risk
**Solution Required:**
```typescript
// Priority test coverage:
// 1. CollapsibleSection component
// 2. Shared control components
// 3. Mobile override functionality
// 4. Store actions (updateBlock, etc.)
// 5. Accessibility validation
```

**Test Files to Create:**
- `/src/components/ui/__tests__/CollapsibleSection.test.tsx`
- `/src/components/controls/shared/__tests__/ColorControl.test.tsx`
- `/src/components/controls/shared/__tests__/PaddingControl.test.tsx`
- `/src/stores/__tests__/emailStore.test.ts`
- `/src/lib/validation/__tests__/accessibility.test.ts`

**Acceptance Criteria:**
- [ ] >60% code coverage for Style Tab components
- [ ] All shared controls have unit tests
- [ ] Store actions have tests
- [ ] Integration tests for block switching
- [ ] CI/CD pipeline runs tests

---

## Phase 3: UX Enhancements from Design-Agent (Week 3-6)

### HIGH PRIORITY: Onboarding & Discoverability

#### 11. First-Time User Onboarding Tour (3-4 days)
**Issue:** New users dropped into editor with zero guidance
**Impact:** High learning curve, users miss features
**Solution Required:**
```typescript
// Use react-joyride or similar
const steps = [
  {
    target: '.block-library',
    content: 'Drag blocks from here to build your email',
  },
  {
    target: '.style-tab',
    content: 'Style your blocks here. Click ▶ to expand sections',
  },
  {
    target: '.viewport-toggle',
    content: 'Preview in desktop and mobile modes',
  },
]
```

**Files to Create:**
- `/src/components/onboarding/OnboardingTour.tsx`
- `/src/stores/userPreferencesStore.ts` - Track if tour completed
- Integration into main App component

**Acceptance Criteria:**
- [ ] Tour shows on first app load
- [ ] 4-5 step walkthrough of key features
- [ ] Can skip or replay tour
- [ ] Tour completed flag saved to localStorage
- [ ] Animated, visually appealing

---

#### 12. Section Badges & Visual Indicators (1-2 days)
**Issue:** Users may not discover collapsed sections
**Impact:** Missing features like mobile overrides
**Solution Required:**
```typescript
// Badge showing override count
<CollapsibleSection
  title="Responsive"
  badge={getMobileOverrideCount(block)} // Shows "2"
/>

// Pulse animation on first use
const [hasSeenSection, setHasSeenSection] = useState(false)
useEffect(() => {
  if (!hasSeenSection && shouldHighlight) {
    // Pulse animation
  }
}, [])
```

**Files to Modify:**
- `/src/components/ui/CollapsibleSection.tsx` - Add badge support
- `/src/components/layout/DesignControls.tsx` - Calculate badge values
- Add CSS animations for pulse effect

**Acceptance Criteria:**
- [ ] Responsive section shows override count badge
- [ ] Brand Styles section shows color count
- [ ] Subtle pulse animation on first appearance
- [ ] Visual indicators help discoverability

---

#### 13. Contextual Help Tooltips (1-2 days)
**Issue:** Users unsure what sections do
**Impact:** Reduced feature adoption
**Solution Required:**
```typescript
// "?" icon next to section headers
<CollapsibleSection
  title="Responsive"
  helpText="Customize how your email looks on mobile devices"
  helpUrl="/docs/mobile-optimization"
/>

// Tooltip component
<Tooltip content="Mobile overrides let you adjust font sizes, padding, etc.">
  <InfoIcon />
</Tooltip>
```

**Files to Modify:**
- `/src/components/ui/CollapsibleSection.tsx` - Add help icon
- Create `/src/components/ui/Tooltip.tsx`
- Add tooltips to all section headers

**Acceptance Criteria:**
- [ ] Help icon (?) appears next to section titles
- [ ] Hover shows explanatory tooltip
- [ ] Tooltips are clear, concise (1-2 sentences)
- [ ] Optional link to documentation

---

### MEDIUM PRIORITY: Advanced Features

#### 14. Search/Filter for Style Tab (2-3 days)
**Issue:** With collapsed sections, some controls harder to find
**Impact:** Power users slowed down
**Solution Required:**
```typescript
// Add search box at top of Style Tab
<input
  type="text"
  placeholder="Search controls..."
  onChange={(e) => filterControls(e.target.value)}
/>

// Typing "mobile" auto-expands Responsive section
// Typing "padding" highlights padding control
```

**Files to Create:**
- `/src/components/layout/StyleTabSearch.tsx`
- Search logic to filter/highlight controls
- Auto-expand sections with matches

**Acceptance Criteria:**
- [ ] Search box at top of Style Tab
- [ ] Typing filters visible controls
- [ ] Auto-expands sections with matches
- [ ] Highlights matching controls
- [ ] Keyboard shortcut to focus search (Cmd+F)

---

#### 15. Recently Used Controls (1-2 days)
**Issue:** Frequent controls require expanding sections each time
**Impact:** Efficiency loss for power users
**Solution Required:**
```typescript
// Track most-used controls per block type
interface ControlUsage {
  [blockType: string]: {
    [controlName: string]: number // usage count
  }
}

// Show top 3-5 recently used controls at top of Style Tab
<div className="recently-used">
  <h4>Recently Used</h4>
  <ColorControl label="Text Color" value={block.data.color} />
  <FontControl label="Font" value={block.data.fontFamily} />
</div>
```

**Files to Modify:**
- `/src/stores/userPreferencesStore.ts` - Track control usage
- `/src/components/layout/DesignControls.tsx` - Show recently used
- Save to localStorage

**Acceptance Criteria:**
- [ ] Top 5 recently used controls shown at top
- [ ] Updates based on user behavior
- [ ] Persisted to localStorage
- [ ] Can dismiss if not wanted

---

## Phase 4: Competitive Parity Features (Week 7-12)

### Missing Industry-Standard Blocks

#### 16. Video Block (COMPLETED - December 26, 2025)
**Status:** ✅ COMPLETED
**Implementation:**
- ✅ Thumbnail upload (auto-fetched for YouTube)
- ✅ Video URL (YouTube, Vimeo, custom)
- ✅ Play button overlay styling
- ✅ Fallback for non-supporting clients (linked thumbnail)
- ✅ Width control (200-640px)
- ✅ Border radius control
- ✅ Alignment options
- ✅ Alt text for accessibility
- ✅ Email-safe HTML generation

#### 17. Social Icons Block (COMPLETED - December 26, 2025)
**Status:** ✅ COMPLETED
**Implementation:**
- ✅ Icon style selection (colored, monochrome, outlined, circular, square)
- ✅ Icon size control (24-48px)
- ✅ Link inputs for each platform
- ✅ Horizontal layout with customizable spacing
- ✅ 9 platform support (Facebook, X/Twitter, Instagram, LinkedIn, YouTube, TikTok, Pinterest, GitHub, Custom)
- ✅ Custom icon color for monochrome/outlined styles
- ✅ Email-safe HTML generation with inline SVG

#### 18. Countdown Timer Block (3-4 days)
**Status:** MEDIUM PRIORITY
**Implementation:**
- End date/time selection
- Timezone handling
- Integration with Sendtric or motionmail.app
- Server-side image generation

#### 19. Menu/Navigation Block (2-3 days)
**Status:** MEDIUM PRIORITY
**Implementation:**
- Horizontal menu bar
- Link management
- Active state styling
- Mobile: hamburger or stacked

#### 20. Product Card Block (3-4 days)
**Status:** MEDIUM PRIORITY (depends on target market)
**Implementation:**
- Product image
- Title, description
- Price (original + sale)
- CTA button
- Grid layout (1-4 per row)

#### 21. HTML/Code Block (1-2 days)
**Status:** LOW PRIORITY (advanced users)
**Implementation:**
- Raw HTML/CSS input
- Syntax highlighting
- Security: sanitize to remove `<script>`
- Preview mode

### Template Library Expansion

#### 22. Expand Templates from 8 to 30+ (10-15 hours)
**Categories Needed:**
- Newsletter (3-5 templates)
- Promotional/Sales (3-5 templates)
- Welcome/Onboarding (2-3 templates)
- Transactional (3-4 templates)
- Event Invitations (2-3 templates)
- Product Launches (2-3 templates)
- Seasonal/Holiday (5-10 templates)

### AI Features

#### 23. AI Alt Text Generation (1 week)
**Status:** COMPETITIVE ADVANTAGE - Only Stripo has this
**Implementation:**
```typescript
async function generateAltText(imageUrl: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        { type: 'text', text: 'Generate concise alt text for this image...' }
      ]
    }]
  })
  return response.content[0].text
}
```

#### 24. Typography Quick-Apply Presets (2-4 hours)
**Implementation:**
- Save typography presets (H1 style, H2 style, body)
- One-click apply to blocks
- Update global preset → updates all blocks using it

---

## Phase 5: Accessibility & Polish (Week 13-14)

#### 25. Accessibility Audit (Already Complete ✓)
- Color contrast checking
- Heading hierarchy
- Alt text validation
- Link text validation
- Touch target sizes

#### 26. Keyboard Navigation for Style Tab (2-3 days)
**Missing:** Keyboard shortcuts
**Implementation:**
- Space/Enter to expand/collapse sections
- Arrow keys to navigate between sections
- Tab to navigate controls
- Keyboard shortcuts documentation

#### 27. ARIA Labels & Screen Reader Support (1-2 days)
**Implementation:**
```typescript
<button
  onClick={() => setIsOpen(!isOpen)}
  aria-expanded={isOpen}
  aria-controls="section-content-id"
  aria-label="Toggle Responsive section"
>
```

#### 28. Visual Regression Testing (2-3 days)
**Implementation:**
- Set up Playwright + pixelmatch
- Snapshot tests for all block types
- Snapshot tests for Style Tab states
- CI/CD integration

---

## Tracking & Monitoring

### Metrics to Track Post-Launch

#### User Experience Metrics
- [ ] Time to style a block (target: <25s, currently ~45s)
- [ ] Clicks to complete styling task (target: <5, currently 8-12)
- [ ] Style Tab session duration (expect increase)
- [ ] Feature discovery rate (via analytics)
- [ ] Mobile override adoption rate

#### Technical Metrics
- [ ] Re-render count per block update (target: <5)
- [ ] Style Tab load time (target: <100ms)
- [ ] Bundle size (target: <+20KB for new features)
- [ ] Memory usage with 100+ block emails
- [ ] Error rate (target: <0.1%)

#### Business Metrics
- [ ] User confusion reports (target: 70% reduction)
- [ ] Support tickets for "where is X?" (target: 50% reduction)
- [ ] User retention (expect increase)
- [ ] NPS score (target: +10 points)

---

## Documentation Needed

### For Each Major Change

#### Style Tab Restructure
- [ ] Migration guide for users
- [ ] Before/after comparison screenshots
- [ ] Video tutorial (2-3 minutes)
- [ ] Architecture Decision Record (ADR)
- [ ] Component API documentation

#### Technical Refactoring
- [ ] Store splitting rationale
- [ ] Performance optimization results
- [ ] Testing strategy documentation
- [ ] Rollback procedures

---

## Priority Summary

### Must Do (Phase 1-2, Week 1-6)
1. ✅ Mobile preview enhancements
2. ✅ Dark mode support
3. ✅ Accessibility validation
4. 🔄 Style Tab restructure (IN PROGRESS)
5. State management refinement
6. Component architecture cleanup
7. Type safety improvements
8. Onboarding tour
9. Visual indicators & badges

### Should Do (Phase 3-4, Week 7-12)
10. Store splitting
11. Performance optimization
12. Video block
13. Social icons block
14. Template expansion
15. AI alt text generation
16. Search/filter for Style Tab

### Nice to Have (Phase 5, Week 13+)
17. ContentEditable hook refactor
18. Recently used controls
19. Countdown timer block
20. Menu/navigation block
21. Product card block
22. Advanced keyboard navigation
23. Visual regression testing

---

## Risk Mitigation

### If Timeline Slips

**Buffer Strategies:**
1. Ship Style Tab in stages (HeadingControls first, then others)
2. Defer low-priority polish items
3. Ship with known technical debt, schedule cleanup
4. Use AI assistance to accelerate boilerplate

### If Major Issues Found

**Rollback Plan:**
1. Feature flag to toggle old/new Style Tab UI
2. Git branch with old code preserved
3. Can revert in <1 hour if critical bugs
4. Staged rollout to 10% → 50% → 100% users

---

## Notes

- This tracker is a living document - update as priorities shift
- Not all recommendations need implementation - revisit quarterly
- Focus on user impact first, technical perfection second
- Ship fast, iterate based on real feedback

**Last Updated:** December 26, 2025
**Next Review:** After Style Tab launch (Week 2)
