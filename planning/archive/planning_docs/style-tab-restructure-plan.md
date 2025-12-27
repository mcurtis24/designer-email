# Style Tab Restructure - Implementation Plan

**Status:** Ready for Implementation
**Priority:** CRITICAL
**Estimated Effort:** 3-5 days
**Date Created:** December 26, 2025

---

## Problem Statement

The current Style Tab is **the #1 UX issue** in the application. It suffers from:

1. **Too Many Modes**: Desktop/Mobile toggles appear in 3-4 different places, creating cognitive overload
2. **No Clear Hierarchy**: All controls have equal visual weight, making it hard to distinguish primary from advanced controls
3. **Excessive Scrolling**: The sidebar becomes a never-ending scroll, causing users to lose context
4. **Inconsistent Patterns**: Some properties show Desktop/Mobile inline, others as section headers
5. **Hidden Features**: Important features buried in collapsed `<details>` elements
6. **QuickApplyToolbar Redundancy**: Brand colors already prominent in ColorThemePicker

**User Impact:** Users spend 2-3x longer styling blocks compared to competitors like Canva due to hunting for controls and managing multiple toggle states.

---

## Goals

### Primary Goals
1. **Reduce Cognitive Load**: Users should see 5-6 core controls immediately, with advanced options hidden
2. **Single Source of Truth**: ONE responsive mode toggle at the top (if needed), no per-property toggles
3. **Clear Visual Hierarchy**: Group controls into logical sections with clear headings
4. **Progressive Disclosure**: Show most common controls first, hide advanced settings
5. **Consistent Patterns**: All block types follow the same organizational structure

### Success Metrics
- Time to style a block: Reduce from 45s → 20s (measured via user testing)
- Number of clicks to complete styling task: Reduce from 8-12 → 3-5
- User confusion reports: Reduce by 70%+

---

## Proposed Structure

### New Organization

```
┌─────────────────────────────────────────┐
│ STYLE TAB                               │
├─────────────────────────────────────────┤
│                                         │
│ [Heading Block]  ← Block type indicator│
│                                         │
│ ┌─ APPEARANCE ─────────────────────┐  │ ← Section (expanded by default)
│ │ • Text Color          [#000000 ▼] │  │   Common controls, visual priority
│ │ • Background          [None    ▼] │  │
│ │ • Font Family         [Inter   ▼] │  │
│ │ • Font Size           [24px    ▼] │  │
│ │ • Font Weight         [600     ▼] │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌─ LAYOUT ─────────────────────────┐  │ ← Section (expanded by default)
│ │ • Alignment          [Left ▼]     │  │   Spacing & positioning
│ │ • Padding            [16px...]    │  │
│ │ • Line Height        [1.5      ]  │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ▶ RESPONSIVE (Mobile Overrides)        │ ← Section (collapsed by default)
│                                         │
│ ▶ BRAND STYLES                         │ ← Section (collapsed by default)
│                                         │
│ ▶ ADVANCED                             │ ← Section (collapsed by default)
│                                         │
│ [Save as Component]  ← Action button   │
│                                         │
└─────────────────────────────────────────┘
```

### Section Breakdown

#### 1. APPEARANCE Section (Always Expanded)
**Contents**: Visual styling properties users adjust most frequently

**For Headings:**
- Text Color (with brand color integration)
- Background Color (optional)
- Font Family
- Font Size
- Font Weight

**For Text:**
- Text Color
- Background Color (optional)
- Font Family
- Font Size

**For Buttons:**
- Background Color
- Text Color
- Border Radius

**For Images:**
- Alignment
- Width
- Border Radius
- Link URL (if applicable)

#### 2. LAYOUT Section (Always Expanded)
**Contents**: Spacing, alignment, positioning

**Common Properties:**
- Alignment (left, center, right, justify)
- Padding (unified control with optional individual sides)
- Line Height (for text blocks)
- Visibility (desktop/mobile checkboxes)

#### 3. RESPONSIVE Section (Collapsed by Default)
**Contents**: Mobile-specific overrides

**Trigger:** Only shown when viewport toggle is set to "Mobile" OR when mobile overrides exist

**Contents:**
- Font Size (mobile override)
- Padding (mobile override)
- Line Height (mobile override)
- **Visual Indicator**: Blue dot badge on properties with active mobile overrides

**Behavior:**
- When user toggles to mobile mode in top nav, this section auto-expands
- Show "Reset to Desktop Value" button for each override
- Clear visual distinction between desktop and mobile values

#### 4. BRAND STYLES Section (Collapsed by Default)
**Contents**: Quick-apply brand presets

**For Text/Headings:**
- Typography Presets (H1 Style, H2 Style, Body Style)
- One-click apply button for each preset

**For All Blocks:**
- Brand Color Swatches (quick apply to background or text)
- "Save Current Style as Preset" button

**Note:** Remove redundant QuickApplyToolbar - integrate functionality here

#### 5. ADVANCED Section (Collapsed by Default)
**Contents**: Rarely-used or expert-level controls

**Examples:**
- Custom CSS classes
- HTML attributes
- Z-index/stacking order
- Animation settings (future)

---

## Implementation Steps

### Phase 1: Create New Component Structure (Day 1)

#### Step 1.1: Create Collapsible Section Component
**File:** `/src/components/ui/CollapsibleSection.tsx`

```typescript
interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  badge?: string | number // For indicators like "2 overrides"
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  children
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            {/* Chevron icon */}
          </svg>
          <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {title}
          </span>
        </div>
        {badge && (
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
```

**Test:** Verify expand/collapse animation, badge display, hover states

#### Step 1.2: Create Unified Control Components
**Files to Create:**
- `/src/components/controls/shared/ColorControl.tsx` - Reusable color picker
- `/src/components/controls/shared/FontControl.tsx` - Font family selector
- `/src/components/controls/shared/SizeControl.tsx` - Size input with units
- `/src/components/controls/shared/AlignmentControl.tsx` - Alignment buttons
- `/src/components/controls/shared/PaddingControl.tsx` - Unified padding control

**Benefits:**
- DRY principle (don't repeat yourself)
- Consistent behavior across all block types
- Easier to add features (e.g., brand color integration) once

**Example - ColorControl.tsx:**
```typescript
interface ColorControlProps {
  label: string
  value: string
  onChange: (color: string) => void
  showBrandColors?: boolean
  allowNone?: boolean
}

export function ColorControl({
  label,
  value,
  onChange,
  showBrandColors = true,
  allowNone = true
}: ColorControlProps) {
  const [showPicker, setShowPicker] = useState(false)
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full h-10 rounded-md border border-gray-300 flex items-center gap-2 px-3 hover:border-gray-400 transition-colors"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: value || '#ffffff' }}
        />
        <span className="text-sm text-gray-900">{value || 'None'}</span>
      </button>

      {showPicker && (
        <ColorThemePicker
          color={value}
          onChange={onChange}
          onClose={() => setShowPicker(false)}
          showBrandColors={showBrandColors}
          allowNone={allowNone}
        />
      )}
    </div>
  )
}
```

---

### Phase 2: Refactor DesignControls.tsx (Day 2)

#### Step 2.1: Remove QuickApplyToolbar
**File:** `/src/components/layout/DesignControls.tsx`

**Changes:**
```typescript
// REMOVE:
{brandColors.length > 0 && (
  <QuickApplyToolbar brandColors={brandColors} />
)}
```

**Reasoning:** Redundant - brand colors already prominent in ColorThemePicker. Functionality moved to "Brand Styles" collapsed section.

#### Step 2.2: Update Block Controls Structure
**File:** `/src/components/layout/DesignControls.tsx`

**New Structure:**
```typescript
const renderBlockControls = () => {
  if (!selectedBlock) return null

  return (
    <div className="h-full flex flex-col">
      {/* Block Type Header - STICKY */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
          {getBlockIcon(selectedBlock.type)}
          {selectedBlock.type} Block
        </h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* APPEARANCE Section */}
        <CollapsibleSection title="Appearance" defaultOpen={true}>
          {renderAppearanceControls(selectedBlock)}
        </CollapsibleSection>

        {/* LAYOUT Section */}
        <CollapsibleSection title="Layout" defaultOpen={true}>
          {renderLayoutControls(selectedBlock)}
        </CollapsibleSection>

        {/* RESPONSIVE Section */}
        <CollapsibleSection
          title="Responsive (Mobile)"
          defaultOpen={false}
          badge={getMobileOverrideCount(selectedBlock)}
        >
          {renderResponsiveControls(selectedBlock)}
        </CollapsibleSection>

        {/* BRAND STYLES Section */}
        {brandColors.length > 0 && (
          <CollapsibleSection title="Brand Styles" defaultOpen={false}>
            {renderBrandStylesControls(selectedBlock)}
          </CollapsibleSection>
        )}

        {/* ADVANCED Section */}
        <CollapsibleSection title="Advanced" defaultOpen={false}>
          {renderAdvancedControls(selectedBlock)}
        </CollapsibleSection>
      </div>

      {/* Action Buttons - STICKY BOTTOM */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
        >
          Save as Component
        </button>
      </div>
    </div>
  )
}
```

---

### Phase 3: Refactor Individual Block Controls (Day 3)

#### Step 3.1: Update HeadingControls.tsx

**Current Issues:**
- Font controls split between canvas toolbar and sidebar
- Desktop/Mobile toggles for every property
- No visual grouping

**New Structure:**
```typescript
// APPEARANCE controls
export function renderHeadingAppearance(block: EmailBlock) {
  const data = block.data as HeadingBlockData

  return (
    <>
      <ColorControl
        label="Text Color"
        value={data.color}
        onChange={(color) => handleDataChange('color', color)}
      />

      <ColorControl
        label="Background"
        value={data.backgroundColor}
        onChange={(bg) => handleDataChange('backgroundColor', bg)}
        allowNone={true}
      />

      <FontFamilyControl
        label="Font"
        value={data.fontFamily}
        onChange={(font) => handleDataChange('fontFamily', font)}
      />

      <SizeControl
        label="Size"
        value={data.fontSize}
        onChange={(size) => handleDataChange('fontSize', size)}
        unit="px"
      />

      <SelectControl
        label="Weight"
        value={data.fontWeight}
        onChange={(weight) => handleDataChange('fontWeight', weight)}
        options={[
          { label: 'Light (300)', value: 300 },
          { label: 'Regular (400)', value: 400 },
          { label: 'Medium (500)', value: 500 },
          { label: 'Semibold (600)', value: 600 },
          { label: 'Bold (700)', value: 700 },
        ]}
      />
    </>
  )
}

// LAYOUT controls
export function renderHeadingLayout(block: EmailBlock) {
  const data = block.data as HeadingBlockData

  return (
    <>
      <AlignmentControl
        label="Alignment"
        value={data.textAlign}
        onChange={(align) => handleDataChange('textAlign', align)}
      />

      <PaddingControl
        label="Padding"
        value={data.padding}
        onChange={(padding) => handleDataChange('padding', padding)}
      />

      <NumberControl
        label="Line Height"
        value={data.lineHeight}
        onChange={(lh) => handleDataChange('lineHeight', lh)}
        min={1.0}
        max={3.0}
        step={0.1}
      />

      <VisibilityControl
        desktop={data.visibilityDesktop}
        mobile={data.visibilityMobile}
        onChange={(visibility) => handleVisibilityChange(visibility)}
      />
    </>
  )
}

// RESPONSIVE controls (mobile overrides)
export function renderHeadingResponsive(block: EmailBlock) {
  const data = block.data as HeadingBlockData
  const hasMobileOverrides = Boolean(
    data.mobileFontSize || data.mobileLineHeight || data.mobilePadding
  )

  if (!hasMobileOverrides) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No mobile overrides set. Values inherit from desktop.
      </div>
    )
  }

  return (
    <>
      {data.mobileFontSize && (
        <MobileOverrideControl
          label="Font Size (Mobile)"
          value={data.mobileFontSize}
          desktopValue={data.fontSize}
          onChange={(size) => handleDataChange('mobileFontSize', size)}
          onReset={() => handleDataChange('mobileFontSize', null)}
        />
      )}

      {/* Similar for other mobile overrides */}
    </>
  )
}
```

**Files to Update:**
- `/src/components/controls/HeadingControls.tsx`
- `/src/components/controls/TextControls.tsx`
- `/src/components/controls/ButtonControls.tsx`
- `/src/components/controls/ImageControls.tsx`

---

### Phase 4: Simplify Mobile Overrides (Day 4)

#### Current Problem
Every property has its own Desktop/Mobile toggle:
```typescript
// BAD - Current pattern
<div className="flex items-center gap-2">
  <button onClick={() => setMode('desktop')}>Desktop</button>
  <button onClick={() => setMode('mobile')}>Mobile</button>
</div>
<input value={mode === 'desktop' ? desktopValue : mobileValue} />
```

#### New Approach
**Single responsive mode indicator** in top navigation already controls viewport.

**In Style Tab:**
1. Show desktop values by default
2. Provide "+ Add Mobile Override" button for each property
3. When mobile override exists, show both values with clear labels
4. Easy "Reset to Desktop" button

**Example:**
```typescript
interface MobileOverrideControlProps {
  label: string
  value: string | number
  desktopValue: string | number
  onChange: (value: any) => void
  onReset: () => void
  unit?: string
}

export function MobileOverrideControl({
  label,
  value,
  desktopValue,
  onChange,
  onReset,
  unit = 'px'
}: MobileOverrideControlProps) {
  return (
    <div className="space-y-2 p-3 bg-blue-50 rounded-md border border-blue-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-blue-900 uppercase">
          {label}
        </label>
        <button
          onClick={onReset}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset to Desktop
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">Desktop</div>
          <input
            value={desktopValue}
            disabled
            className="w-full px-2 py-1 text-sm bg-gray-100 rounded border border-gray-300"
          />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Mobile (Override)</div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value + unit)}
            className="w-full px-2 py-1 text-sm rounded border border-blue-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
```

---

### Phase 5: Remove CommonControls Redundancy (Day 4)

#### Current Problem
`CommonControls.tsx` handles padding, background, alignment - but these should be in the LAYOUT section of each block type.

#### Solution
1. **Delete** `/src/components/controls/CommonControls.tsx`
2. **Integrate** common properties into block-specific control functions
3. **Use** shared control components (PaddingControl, AlignmentControl) for consistency

**Migration Strategy:**
```typescript
// OLD - CommonControls.tsx
<CommonControls block={selectedBlock} />

// NEW - In HeadingControls.tsx, LayoutSection
<PaddingControl
  value={data.padding}
  onChange={(padding) => handleDataChange('padding', padding)}
/>
<AlignmentControl
  value={data.textAlign}
  onChange={(align) => handleDataChange('textAlign', align)}
/>
```

---

### Phase 6: Brand Styles Integration (Day 5)

#### Remove QuickApplyToolbar, Add Brand Styles Section

**File:** `/src/components/layout/DesignControls.tsx`

```typescript
function renderBrandStylesControls(block: EmailBlock) {
  const brandColors = useEmailStore((state) => state.email.settings.brandColors)
  const typographyPresets = useEmailStore((state) => state.email.settings.typographyPresets)

  return (
    <div className="space-y-4">
      {/* Brand Colors */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 uppercase mb-2">
          Brand Colors
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {brandColors.map((color, index) => (
            <button
              key={index}
              onClick={() => applyBrandColor(color, block)}
              className="group relative w-full aspect-square rounded-md border-2 border-gray-200 hover:border-blue-500 transition-colors"
              style={{ backgroundColor: color }}
              title={`Apply ${color}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Typography Presets (for text/heading blocks) */}
      {(block.type === 'heading' || block.type === 'text') && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 uppercase mb-2">
            Typography Presets
          </h4>
          {typographyPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyTypographyPreset(preset, block)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-500">
                {preset.fontFamily} • {preset.fontSize} • {preset.fontWeight}
              </div>
            </button>
          ))}

          <button
            onClick={() => saveCurrentAsPreset(block)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Save Current as Preset
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Testing Plan

### Unit Tests
- [ ] CollapsibleSection expand/collapse behavior
- [ ] Badge display when overrides exist
- [ ] Shared control components (ColorControl, FontControl, etc.)
- [ ] Mobile override reset functionality

### Integration Tests
- [ ] Switching between block types updates controls correctly
- [ ] Mobile overrides persist when switching blocks
- [ ] Brand color application updates block correctly
- [ ] Typography preset application works

### User Testing
**Scenario 1: Style a Heading**
- User should complete in < 20 seconds
- Max 3-5 clicks to change font, size, color

**Scenario 2: Add Mobile Override**
- User should find "+ Add Mobile Override" easily
- Override should be clearly labeled
- Reset should work in 1 click

**Scenario 3: Apply Brand Color**
- User should find brand colors in Brand Styles section
- One click to apply

---

## Rollout Strategy

### Phase A: Soft Launch (Internal Testing)
1. Deploy to staging environment
2. Test with 5-10 internal users
3. Gather feedback on clarity, speed, discoverability
4. Fix critical issues

### Phase B: Beta Release
1. Release to opt-in beta users (20-30 users)
2. Monitor analytics: time-to-style, clicks, bounce rate
3. Conduct user interviews
4. Iterate on feedback

### Phase C: Full Release
1. Create migration guide for existing users
2. Add onboarding tooltip highlighting new structure
3. Release to all users
4. Monitor support tickets for confusion

---

## Risks & Mitigation

### Risk 1: Users Can't Find Controls
**Mitigation:**
- Add search/filter to Style Tab
- Show recently-used controls at top
- Onboarding tooltip: "Controls now organized into sections"

### Risk 2: Mobile Override Confusion
**Mitigation:**
- Clear visual distinction (blue background for overrides)
- Auto-expand Responsive section when mobile mode active
- Add "?" tooltip explaining mobile overrides

### Risk 3: Breaking Changes for Existing Users
**Mitigation:**
- Preserve all existing data structures (no migration needed)
- UI-only changes, no backend changes
- Gradually introduce new patterns (keep old controls for 1 release cycle)

---

## Success Criteria

### Quantitative
- [ ] Time to style a block: < 25 seconds (down from 45s)
- [ ] Clicks to style: < 5 (down from 8-12)
- [ ] User confusion reports: < 5 per week (down from 20+)
- [ ] Style Tab usage (time spent): Increase by 20%

### Qualitative
- [ ] User feedback: "Much easier to find controls"
- [ ] Support tickets: Decrease in "where is X control?" questions
- [ ] NPS score: Increase by 10+ points

---

## Files to Create/Modify

### New Files (Create)
- `/src/components/ui/CollapsibleSection.tsx`
- `/src/components/controls/shared/ColorControl.tsx`
- `/src/components/controls/shared/FontControl.tsx`
- `/src/components/controls/shared/SizeControl.tsx`
- `/src/components/controls/shared/AlignmentControl.tsx`
- `/src/components/controls/shared/PaddingControl.tsx`
- `/src/components/controls/shared/MobileOverrideControl.tsx`
- `/src/components/controls/shared/VisibilityControl.tsx`

### Files to Modify
- `/src/components/layout/DesignControls.tsx` (major refactor)
- `/src/components/controls/HeadingControls.tsx` (refactor into sections)
- `/src/components/controls/TextControls.tsx` (refactor into sections)
- `/src/components/controls/ButtonControls.tsx` (refactor into sections)
- `/src/components/controls/ImageControls.tsx` (refactor into sections)
- `/src/components/controls/GalleryControls.tsx` (refactor into sections)
- `/src/components/controls/LayoutControls.tsx` (refactor into sections)
- `/src/components/controls/FooterControls.tsx` (refactor into sections)

### Files to Delete
- `/src/components/ui/QuickApplyToolbar.tsx` (redundant)
- `/src/components/controls/CommonControls.tsx` (integrate into blocks)

---

## Implementation Checklist

### Day 1: Foundation
- [ ] Create CollapsibleSection component
- [ ] Create shared control components (Color, Font, Size, Alignment, Padding)
- [ ] Write unit tests for new components
- [ ] Test visual design and interactions

### Day 2: DesignControls Refactor
- [ ] Update DesignControls.tsx structure
- [ ] Remove QuickApplyToolbar
- [ ] Implement section rendering functions
- [ ] Add sticky header and footer
- [ ] Test section expand/collapse

### Day 3: Block Controls Migration
- [ ] Refactor HeadingControls into sections
- [ ] Refactor TextControls into sections
- [ ] Refactor ButtonControls into sections
- [ ] Refactor ImageControls into sections
- [ ] Test all block types

### Day 4: Mobile Overrides
- [ ] Create MobileOverrideControl component
- [ ] Implement "Add Mobile Override" functionality
- [ ] Add mobile override badges
- [ ] Auto-expand Responsive section when mobile mode active
- [ ] Test override creation, editing, deletion

### Day 5: Brand Styles & Polish
- [ ] Implement Brand Styles section
- [ ] Migrate brand color functionality from QuickApplyToolbar
- [ ] Add typography preset system
- [ ] Final polish (spacing, colors, animations)
- [ ] Comprehensive testing

---

## Post-Launch

### Week 1
- Monitor support tickets
- Track analytics (time-to-style, clicks)
- Gather user feedback via in-app survey

### Week 2-4
- Iterate based on feedback
- Add any missing features
- Optimize performance
- Create video tutorial for new structure

---

## Notes

- This restructure is the **highest impact UX improvement** we can make
- Focus on **progressive disclosure** - show common controls first, hide advanced
- **Consistency** across all block types is critical for learnability
- Test with **real users** before full release - this is a major change

**Estimated Total Effort:** 3-5 days of focused development + 2-3 days of testing and iteration
