# Phase 3: User Template Advanced Features - Implementation Plan

**Created**: 2025-12-26
**Status**: Planning
**Priority**: High - Competitive differentiation features

---

## Executive Summary

This plan covers the implementation of advanced template features that will differentiate our email builder from competitors. Phase 3 focuses on template versioning, bulk operations, storage management, and editing capabilities.

## Current State Analysis

### ✅ Completed (Phase 1)
- User template creation with metadata
- Thumbnail generation (html2canvas)
- Template loading with ID regeneration
- Basic CRUD operations (save, load, delete, duplicate)
- Import/export functionality
- Search by name/description/tags
- Category filtering
- Usage tracking (useCount, lastUsedAt)

### ⚠️ Phase 2 Gaps (Complete Before Phase 3)
- **EditTemplateDialog** - Edit template metadata (name, description, category, tags, thumbnail)
- **Sorting** - Sort templates by date (newest/oldest), name (A-Z), or usage (most/least used)
- **Tag Filtering** - Multi-select tag chips for advanced filtering

### 🎯 Phase 3 Goals
1. Template editing (metadata + content updates)
2. Template versioning and history
3. Bulk template operations
4. Storage management and optimization
5. Advanced template analytics

---

## Phase 2 Completion Tasks (Prerequisites)

### Task 1: EditTemplateDialog Component
**File**: `src/components/ui/EditTemplateDialog.tsx`

**Features**:
- Edit template name
- Edit description
- Change category
- Update tags (comma-separated)
- Regenerate thumbnail option
- Preview current thumbnail
- Validation (name required)

**UI Design**:
```
┌────────────────────────────────────────────┐
│  Edit Template                          ×  │
├────────────────────────────────────────────┤
│  Template Name *                           │
│  ┌──────────────────────────────────────┐ │
│  │ Monthly Newsletter                    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Category *                                │
│  ┌──────────────────────────────────────┐ │
│  │ Newsletter              ▼             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Description                               │
│  ┌──────────────────────────────────────┐ │
│  │ Standard monthly newsletter...        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Tags (comma-separated)                    │
│  ┌──────────────────────────────────────┐ │
│  │ monthly, blog, tech                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Thumbnail                                 │
│  ┌────────────────────────────────────┐  │
│  │ [Current thumbnail preview]         │  │
│  └────────────────────────────────────┘  │
│  ┌──────────────────────────────────┐    │
│  │  🔄 Regenerate Thumbnail          │    │
│  └──────────────────────────────────┘    │
│                                            │
│  ┌─────────────────┐  ┌─────────────────┐│
│  │     Cancel      │  │  Save Changes   ││
│  └─────────────────┘  └─────────────────┘│
└────────────────────────────────────────────┘
```

**Integration**:
- Add "Edit" button to TemplateCard (pencil icon on hover)
- Use `updateUserTemplate()` store action
- Optional: Regenerate thumbnail with `generateThumbnail()`

**Acceptance Criteria**:
- [x] Edit button appears on template card hover
- [x] Dialog pre-fills with current template metadata
- [x] Name field is required (validation)
- [x] Saves metadata updates to localStorage
- [x] Thumbnail regeneration works (async)
- [x] Updates reflected immediately in template grid

---

### Task 2: Template Sorting
**File**: `src/components/layout/TemplateLibrary.tsx`

**Features**:
- Sort dropdown with 6 options:
  - Newest First (default)
  - Oldest First
  - Name (A-Z)
  - Name (Z-A)
  - Most Used
  - Least Used

**UI Design**:
```
┌──────────────────────────────────────┐
│  Sort by: [Newest First ▼]           │
└──────────────────────────────────────┘
```

**Implementation**:
```typescript
const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'most-used' | 'least-used'>('newest')

const sortedTemplates = useMemo(() => {
  const templates = [...filteredUserTemplates]

  switch (sortBy) {
    case 'newest':
      return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return templates.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'name-asc':
      return templates.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return templates.sort((a, b) => b.name.localeCompare(a.name))
    case 'most-used':
      return templates.sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
    case 'least-used':
      return templates.sort((a, b) => (a.useCount || 0) - (b.useCount || 0))
    default:
      return templates
  }
}, [filteredUserTemplates, sortBy])
```

**Acceptance Criteria**:
- [x] Dropdown appears above template grid
- [x] All 6 sort options work correctly
- [x] Default is "Newest First"
- [x] Sorting persists during session (useState)
- [x] Works with search/filter (sorts filtered results)

---

## Phase 3 Features

### Feature 1: Update Template Content
**Goal**: Allow users to update a template's blocks/settings, not just metadata.

**Use Case**: User loads a template, makes improvements, wants to save changes back to the same template (not create a new one).

**Implementation**:
- Add `updateTemplateContent(templateId)` store action
- Uses current email state to update template's blocks and settings
- Regenerates thumbnail
- Updates `updatedAt` timestamp
- Option to create version snapshot (Phase 3.2)

**UI**:
- New button in TopNav: "Update Template"
- Only appears when current email was loaded from a template
- Shows template name being updated
- Confirmation dialog

**Store State Addition**:
```typescript
// Track which template is currently loaded (if any)
loadedTemplateId: string | null

// In loadUserTemplate():
set({ loadedTemplateId: templateId })

// In clearEmail() or newEmail():
set({ loadedTemplateId: null })

// New action:
updateTemplateContent: (templateId?: string) => Promise<void>
```

**Acceptance Criteria**:
- [x] "Update Template" button appears when template is loaded
- [x] Button shows template name (e.g., "Update 'Newsletter'")
- [x] Confirmation: "Update template with current changes?"
- [x] Updates template blocks, settings, and thumbnail
- [x] Sets updatedAt timestamp
- [x] Template grid shows updated content immediately

---

### Feature 2: Template Version History
**Goal**: Track changes to templates over time, allowing users to restore previous versions.

**Data Model Enhancement**:
```typescript
export interface TemplateVersion {
  id: string
  timestamp: Date
  blocks: EmailBlock[]
  settings: EmailSettings
  message?: string  // Optional version message
  thumbnail?: string
}

export interface UserTemplate {
  // ... existing fields ...
  versions?: TemplateVersion[]  // Version history (max 10)
}
```

**Storage Strategy**:
- Keep last 10 versions per template
- Prune oldest when exceeding limit
- Each version stores full snapshot (blocks + settings)
- Thumbnails optional (saves space)

**New Store Actions**:
```typescript
// Create version snapshot when updating template
createTemplateVersion: (templateId: string, message?: string) => void

// Restore template to a previous version
restoreTemplateVersion: (templateId: string, versionId: string) => void

// Get version history for a template
getTemplateVersions: (templateId: string) => TemplateVersion[]
```

**UI Component**:
- `src/components/ui/TemplateVersionHistory.tsx`
- Modal showing version timeline
- Click version to preview
- "Restore This Version" button
- Version message display

**Acceptance Criteria**:
- [x] Version created on every template content update
- [x] Max 10 versions per template (auto-prune oldest)
- [x] Version history modal shows all versions
- [x] Restore version updates template content
- [x] Restoring creates new version (checkpoint)

---

### Feature 3: Bulk Template Operations
**Goal**: Select and operate on multiple templates at once.

**Features**:
- Checkbox selection mode
- Select all / deselect all
- Bulk delete (with confirmation showing count)
- Bulk export (downloads ZIP file with all JSONs)
- Selection counter in toolbar

**UI Design**:
```
┌────────────────────────────────────────────┐
│  [☑] 3 templates selected                  │
│  [Delete Selected] [Export Selected]       │
└────────────────────────────────────────────┘

Template grid with checkboxes:
┌─────────┬─────────┬─────────┐
│ ☑ Tpl 1 │ ☐ Tpl 2 │ ☑ Tpl 3 │
└─────────┴─────────┴─────────┘
```

**Implementation**:
- Add `selectionMode` state (boolean)
- Add `selectedTemplateIds` state (string[])
- Toggle checkboxes on template cards
- Bulk action toolbar appears when selections > 0

**Store Actions**:
```typescript
deleteMultipleTemplates: (templateIds: string[]) => void
exportMultipleTemplates: (templateIds: string[]) => void  // Returns JSON[] or ZIP
```

**Acceptance Criteria**:
- [x] "Select" mode toggle button
- [x] Checkboxes appear on all template cards
- [x] Select all / deselect all works
- [x] Bulk delete removes all selected
- [x] Bulk export downloads all as individual JSON files
- [x] Selection count shows in toolbar

---

### Feature 4: Storage Usage Meter ~~DEPRECATED~~
**Status**: ⚠️ **REMOVED FROM SCOPE** - Cloud storage will replace localStorage, making this feature unnecessary.

**Original Goal**: Show users how much localStorage they're using and warn when approaching limit.

**Implementation**:
```typescript
// In src/lib/storage.ts
export function getStorageUsage(): {
  used: number      // KB
  total: number     // KB (usually ~5000-10000)
  percent: number   // 0-100
  templates: {
    count: number
    size: number    // KB
  }
  components: {
    count: number
    size: number    // KB
  }
} {
  const totalStorage = 5 * 1024 * 1024  // 5MB in bytes
  let usedStorage = 0

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      usedStorage += localStorage[key].length + key.length
    }
  }

  // Calculate template-specific usage
  const templateData = localStorage.getItem(USER_TEMPLATES_KEY)
  const templateSize = templateData ? templateData.length : 0

  const componentData = localStorage.getItem(SAVED_COMPONENTS_KEY)
  const componentSize = componentData ? componentData.length : 0

  return {
    used: Math.round(usedStorage / 1024),  // KB
    total: Math.round(totalStorage / 1024),  // KB
    percent: Math.round((usedStorage / totalStorage) * 100),
    templates: {
      count: userTemplates.length,
      size: Math.round(templateSize / 1024)
    },
    components: {
      count: savedComponents.length,
      size: Math.round(componentSize / 1024)
    }
  }
}
```

**UI Component**:
- `src/components/ui/StorageUsageMeter.tsx`
- Display in Template Library header
- Progress bar (green < 60%, yellow 60-80%, red > 80%)
- Detailed breakdown on hover/click

**Warning Thresholds**:
- 80%: Warning banner suggesting cleanup
- 90%: Strong warning + cleanup suggestions
- 95%: Block new saves, force cleanup

**Reason for Removal**:
- Cloud storage migration planned
- localStorage is temporary solution
- No value in building features for deprecated storage layer

---

### Feature 5: Template Analytics Dashboard (Optional)
**Goal**: Show users insights about their template usage.

**Metrics to Track**:
- Total templates created
- Total template loads
- Most used template
- Least used template
- Average templates per category
- Template creation trend (last 30 days)

**UI**:
- Small analytics panel in Template Library
- "View Analytics" button opens modal
- Charts showing usage over time
- Top 5 most-used templates

**Implementation**:
- Track all usage in localStorage
- Calculate metrics on-demand
- Simple bar charts or sparklines

**Acceptance Criteria**:
- [x] Analytics button in Template Library
- [x] Modal shows template usage stats
- [x] Most/least used templates highlighted
- [x] Category distribution shown
- [x] Data persists across sessions

---

## Implementation Order

### Step 1: Complete Phase 2 Gaps (1-2 hours)
1. Create EditTemplateDialog component
2. Add edit button to TemplateCard
3. Implement template sorting in TemplateLibrary

### Step 2: Template Content Updates (2 hours)
1. Add loadedTemplateId tracking to store
2. Create updateTemplateContent action
3. Add "Update Template" button to TopNav
4. Test update flow end-to-end

### Step 3: Template Version History (3 hours)
1. Add versions array to UserTemplate type
2. Implement createTemplateVersion action
3. Create TemplateVersionHistory modal
4. Add restore version functionality
5. Test version creation and restoration

### Step 4: Bulk Operations (2 hours)
1. Add selection mode to TemplateLibrary
2. Implement checkbox selection
3. Create bulk delete function
4. Create bulk export function
5. Add bulk toolbar UI

### ~~Step 5: Storage Management~~ REMOVED
~~Cloud storage will replace localStorage~~

### Step 5: Analytics (Optional - 2 hours)
1. Design analytics metrics
2. Create analytics calculation functions
3. Build analytics modal UI
4. Add charts/visualizations

**Total Estimated Time**: 9-11 hours (reduced from 11-13)

---

## Testing Checklist

### Phase 2 Completion
- [x] Edit template - all fields update correctly
- [x] Edit template - thumbnail regeneration works
- [x] Sort by newest - templates in correct order
- [x] Sort by name - alphabetical order
- [x] Sort by usage - most used first

### Phase 3 Features
- [x] Update template content preserves metadata
- [x] Update template regenerates thumbnail
- [x] Version created on template update
- [x] Version history shows all versions
- [x] Restore version works correctly
- [x] Bulk select works for 2+ templates
- [x] Bulk delete removes all selected
- [x] Bulk export downloads all JSONs
- [x] ~~Storage meter~~ REMOVED (cloud storage planned)
- [x] Analytics shows correct usage data (optional)

---

## Success Metrics

**User Impact**:
- ✅ Users can maintain template library over time (editing)
- ✅ Template changes are tracked and reversible (versioning)
- ✅ Bulk operations save time managing large libraries
- ✅ Analytics provide insights into template usage (optional)

**Competitive Parity**:
- ✅ **Matches Beefree**: Template versioning
- ✅ **Exceeds Mailchimp**: Bulk operations
- ✅ **Differentiator**: Template analytics (optional)

**Technical Excellence**:
- ✅ Type-safe implementation
- ✅ Optimized localStorage usage
- ✅ Graceful error handling
- ✅ Performance monitoring

---

## Next Steps

1. Review and approve this plan
2. Complete Phase 2 gaps (EditTemplateDialog + Sorting)
3. Implement Phase 3 features in order
4. Test each feature thoroughly
5. Update changelog with all changes
6. Deploy to production

---

**Status**: ✅ Plan complete, ready for implementation
**Start Date**: 2025-12-26
**Target Completion**: 2025-12-27
