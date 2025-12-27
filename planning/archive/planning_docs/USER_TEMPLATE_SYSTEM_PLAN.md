# User-Created Template System - Comprehensive Implementation Plan

**Created**: 2025-12-26
**Status**: Planning Phase
**Priority**: High - Critical competitive feature

---

## Executive Summary

This document outlines a comprehensive plan to dramatically enhance the template functionality by leveraging the existing saved components infrastructure to enable user-created templates. The goal is to transform the current static template library into a dynamic, user-driven template management system that matches or exceeds competitor capabilities (Beefree, Stripo, Mailchimp).

**Current State**:
- 8 static JSON templates stored in `/src/lib/templates/`
- Basic template loading with placeholder stripping
- No user-created template capability
- SavedComponent system exists but only for individual blocks

**Target State**:
- User-created templates from current email state
- Organized template library with categories and tags
- Template preview/thumbnail system
- Template editing and versioning
- Template metadata (description, tags, use cases)
- Future: Template sharing/marketplace

---

## Table of Contents

1. [Codebase Analysis](#1-codebase-analysis)
2. [Competitive Analysis](#2-competitive-analysis)
3. [Architecture Design](#3-architecture-design)
4. [Data Model Design](#4-data-model-design)
5. [UI/UX Flow Design](#5-uiux-flow-design)
6. [Storage Strategy](#6-storage-strategy)
7. [Migration Path](#7-migration-path)
8. [Implementation Phases](#8-implementation-phases)
9. [Technical Specifications](#9-technical-specifications)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Codebase Analysis

### 1.1 Current Saved Components System

**Location**: `/src/stores/emailStore.ts` (lines 36-37, 91-95, 711-768)

**Data Model** (`/src/types/email.ts`, lines 226-233):
```typescript
export interface SavedComponent {
  id: string
  name: string
  block: EmailBlock
  thumbnail?: string
  createdAt: Date
  category?: string
}
```

**Storage**:
- Key: `'email-designer-saved-components'`
- Stored in `localStorage`
- Persisted as JSON with date serialization
- Functions: `loadSavedComponentsFromStorage()`, `saveSavedComponentsToStorage()`

**Store Actions**:
- `saveComponent(blockId, name, category)` - Save a block as component
- `loadSavedComponent(componentId)` - Load component with new ID
- `deleteSavedComponent(componentId)` - Remove component
- `getSavedComponents()` - Retrieve all components

**UI Component**: `/src/components/layout/SavedComponentsLibrary.tsx`
- Grid-based display (2 columns)
- Live block preview using scaled BlockRenderer
- Drag-and-drop integration with `@dnd-kit`
- Category badges
- Delete confirmation modal
- Empty state with onboarding message

**Key Insights**:
- ✅ **Solid foundation**: Component system is well-architected
- ✅ **LocalStorage persistence**: Proven working storage pattern
- ✅ **Preview rendering**: Already generates live previews
- ⚠️ **Single block limitation**: Only saves individual blocks, not full emails
- ⚠️ **No thumbnail generation**: Preview is live-rendered, not cached
- ⚠️ **Limited metadata**: Category is optional, no tags/description

### 1.2 Current Template System

**Location**: `/src/lib/templates/` (8 JSON files + index.ts)

**Data Model** (`/src/types/template.ts`):

**Modern Format** (lines 56-60):
```typescript
export interface Template {
  metadata: TemplateMetadata
  blocks: Omit<EmailBlock, 'order'>[]
  settings: TemplateSettings
}

export interface TemplateMetadata {
  id: string
  version: number
  name: string
  category: 'newsletter' | 'promotion' | 'transactional' | 'announcement' | 'event' | 'content' | 'retention'
  description?: string
  thumbnail?: string
  tags?: string[]
  placeholders: Record<string, Record<string, string>>
  createdAt?: Date
  updatedAt?: Date
}
```

**Legacy Format** (lines 69-78) - for backward compatibility

**Template Loading** (`emailStore.ts`, lines 874-939):
1. `validateTemplate()` - Validates structure
2. `stripToPlaceholders()` - Replaces stock content with placeholders
3. Add `order` property to blocks
4. Get metadata
5. Update email state with blocks and settings

**Placeholder System** (`/src/lib/templatePlaceholders.ts`):
- Uses metadata placeholder mappings (not regex)
- Strips stock content (images, text, company info) to generic placeholders
- Type-safe using block type guards
- Handles nested layout blocks recursively

**Template Library UI** (`/src/components/layout/TemplateLibrary.tsx`):
- Category filtering (all, transactional, newsletter, etc.)
- Template thumbnail preview using `TemplateThumbnail` component
- Click to preview (opens `PreviewModal`)
- "Use Template" loads template into editor
- Confirmation dialog before loading

**Key Insights**:
- ✅ **Sophisticated placeholder system**: Maintains clean template structure
- ✅ **Validation layer**: Prevents corrupted templates
- ✅ **Modern + legacy support**: Backward compatible
- ✅ **Preview modal**: Professional preview experience
- ⚠️ **Static templates only**: All templates hardcoded in JSON files
- ⚠️ **No creation flow**: Users cannot save current email as template
- ⚠️ **No editing**: Templates are immutable once loaded

### 1.3 Email Document Model

**Location**: `/src/types/email.ts` (lines 252-262)

```typescript
export interface EmailDocument {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  version: number
  metadata: EmailMetadata
  settings: EmailSettings
  blocks: EmailBlock[]
  history: EmailVersion[]
}
```

**Key Properties for Templates**:
- `blocks[]` - Complete email structure
- `settings` - Typography, colors, dimensions
- `metadata` - Subject, preheader (optional)
- `history[]` - Version snapshots (for future template versioning)

### 1.4 Storage Infrastructure

**Location**: `/src/lib/storage.ts`

**Current Functions**:
- `saveEmailToStorage()` - Saves current email to localStorage
- `loadEmailFromStorage()` - Loads saved email
- `exportEmailJSON()` - Downloads as JSON file
- `importEmailJSON()` - Uploads JSON file

**Storage Key**: `'email-editor-state'`

**Auto-save**: 3-second interval (via `useAutoSave` hook)

**Key Insights**:
- ✅ **Proven serialization**: Handles Date objects correctly
- ✅ **Export/import exists**: Foundation for template portability
- 💡 **Reusable pattern**: Can adapt for template storage

---

## 2. Competitive Analysis

### 2.1 Beefree (Market Leader)

**Source**: [Beefree Features](https://beefree.io/features), [Beefree Review 2025](https://www.fahimai.com/beefree)

**Template Management Features**:
- 1,500+ free templates, 1,700+ occasion-specific templates
- **Folder organization**: Organize templates into folders
- **Saved & Synced Rows**: Reusable headers/footers that sync across templates
- **Synchronized sections**: Modify once, updates all instances across campaigns
- **Multi-brand workspaces**: Separate areas for clients/brands/divisions
- **Role-based permissions**: Admin, Manager, Editor, Contributor, Viewer
- **Multi-language support**: Multiple language versions within single template

**Strengths**:
- Enterprise-grade organization (folders, workspaces)
- Advanced reusability (synced sections)
- Team collaboration features
- Brand consistency tools

**Gaps (Opportunities for Us)**:
- Complex UI overwhelms solo users
- Expensive ($45/month Professional plan)
- Over-engineered for small teams

### 2.2 Stripo

**Source**: [Stripo Features](https://stripo.email/), [Stripo Review 2025](https://www.mailmodo.com/guides/stripo-review/)

**Template Management Features**:
- 1,300-1,600+ free responsive templates
- **Personal template library**: Design once, reuse forever
- **Module library**: Save headers, footers, CTAs as reusable modules
- **Sync modules**: Add same module to many templates
- **Drag-and-drop folders**: Organize templates by name, date, project
- **Bulk editing**: Edit multiple templates/drafts with one click
- **Template export**: HTML, PDF, image formats + 80+ ESP integrations

**Strengths**:
- Excellent module reusability
- Strong organization (folders, bulk operations)
- Template synchronization
- Multi-format export

**Gaps (Opportunities for Us)**:
- Steeper learning curve
- Module system adds complexity
- Less intuitive for beginners

### 2.3 Mailchimp

**Source**: [Mailchimp Templates](https://mailchimp.com/features/email-templates/), [Mailchimp Help](https://mailchimp.com/help/create-a-template-with-the-template-builder/)

**Template Management Features**:
- **Free plan**: Basic, featured, themed templates
- **Paid plans**: Access to full template library
- **Custom templates**: HTML import for advanced users
- **Template categories**: Layout, Featured, Themed (industry-specific)
- **Filtering**: By template type, style, industry
- **Saved templates**: Save custom designs for reuse
- **Marketplace**: Purchase premium templates from designers

**Strengths**:
- Simple, user-friendly approach
- Clear categorization
- Industry-specific themes
- Marketplace for premium content

**Gaps (Opportunities for Us)**:
- Limited organization (no folders)
- Basic metadata (no tags)
- Templates tied to Mailchimp ecosystem

### 2.4 Competitive Positioning

**Our Opportunity**:

1. **Simplicity + Power**: Combine Mailchimp's ease-of-use with Stripo's power
2. **Visual-first**: Better previews and thumbnails than competitors
3. **Smart defaults**: AI-suggested categories and tags (future)
4. **Offline-first**: Works without internet (localStorage advantage)
5. **Free forever**: All template features included, no paywalls

**Feature Parity Requirements** (to be competitive):

| Feature | Beefree | Stripo | Mailchimp | Us (Target) |
|---------|---------|--------|-----------|-------------|
| User-created templates | ✅ | ✅ | ✅ | 🎯 Phase 1 |
| Folder organization | ✅ | ✅ | ❌ | 🎯 Phase 2 |
| Tags/Categories | ✅ | ✅ | ✅ | 🎯 Phase 1 |
| Template preview | ✅ | ✅ | ✅ | ✅ Exists |
| Template editing | ✅ | ✅ | ✅ | 🎯 Phase 2 |
| Template versioning | ✅ | ✅ | ❌ | 🎯 Phase 3 |
| Reusable components | ✅ | ✅ | ❌ | ✅ Exists |
| Bulk operations | ✅ | ✅ | ❌ | 🎯 Phase 3 |
| Template export | ✅ | ✅ | ✅ | ✅ Exists (JSON) |
| Template import | ✅ | ✅ | ✅ | ✅ Exists (JSON) |
| Template sharing | ✅ | ❌ | ✅ (marketplace) | 🎯 Phase 4 |

---

## 3. Architecture Design

### 3.1 Template vs Component Relationship

**Core Principle**: Templates are "snapshots" of complete emails, while Components are reusable building blocks.

```
EmailDocument (Current Email)
├── blocks[] ────────────────────┐
├── settings                     │
└── metadata                     │
                                 │ Save as Template
                                 ↓
                       UserTemplate
                       ├── blocks[] (copy)
                       ├── settings (copy)
                       ├── metadata (name, category, tags, etc.)
                       └── thumbnail (generated screenshot)

EmailBlock (Single Block) ───────┐
                                 │ Save as Component
                                 ↓
                       SavedComponent
                       ├── block (copy)
                       ├── name
                       ├── category
                       └── thumbnail (optional)
```

**Key Relationships**:
1. **Templates contain Components**: A template's blocks can be saved as components
2. **Components build Templates**: Users can create templates from saved components
3. **Independent lifecycle**: Deleting a component doesn't affect templates using it
4. **Separate storage**: Templates and components stored in different localStorage keys

### 3.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     EmailStore (Zustand)                     │
├─────────────────────────────────────────────────────────────┤
│  State:                                                      │
│  ├─ email: EmailDocument          (current working email)  │
│  ├─ savedComponents: SavedComponent[]  (reusable blocks)   │
│  └─ userTemplates: UserTemplate[]      (NEW - full emails) │
│                                                              │
│  Actions:                                                    │
│  ├─ Component Actions (existing)                           │
│  │   ├─ saveComponent()                                     │
│  │   ├─ loadSavedComponent()                               │
│  │   └─ deleteSavedComponent()                             │
│  │                                                           │
│  └─ Template Actions (NEW)                                  │
│      ├─ saveEmailAsTemplate(name, category, description)   │
│      ├─ loadUserTemplate(templateId)                        │
│      ├─ updateUserTemplate(templateId, updates)            │
│      ├─ deleteUserTemplate(templateId)                      │
│      ├─ duplicateUserTemplate(templateId)                   │
│      └─ generateTemplateThumbnail(emailDocument)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  localStorage    │                  │   UI Components   │
├──────────────────┤                  ├──────────────────┤
│ Keys:            │                  │ TemplateLibrary  │
│ - saved-components│                 │ (Enhanced)       │
│ - user-templates │ (NEW)           │                   │
│ - system-templates│(Stock templates)│ SaveTemplateDialog│
│                  │                  │ (NEW)            │
│ Functions:       │                  │                   │
│ - loadUserTemplates() │             │ TemplateCard     │
│ - saveUserTemplates() │             │ (NEW)            │
│ - loadSystemTemplates()│            │                   │
│                  │                  │ TemplateThumbnail│
└──────────────────┘                  └──────────────────┘
```

### 3.3 Template Sources

The system will support **three template sources**:

1. **System Templates** (Static JSON)
   - Shipped with application
   - Immutable
   - Located in `/src/lib/templates/*.json`
   - Badge: "Official" or "Built-in"

2. **User Templates** (localStorage)
   - Created by user from current email
   - Editable
   - Stored in localStorage key: `'email-designer-user-templates'`
   - Badge: "My Template" or user's initials

3. **Imported Templates** (Future)
   - Uploaded JSON files
   - Shared templates from other users
   - Community templates
   - Badge: "Community" or "Imported"

### 3.4 Data Flow Diagrams

#### 3.4.1 Save Email as Template

```
User clicks "Save as Template"
          ↓
SaveTemplateDialog opens
          ↓
User fills form:
  - Template name*
  - Category* (dropdown)
  - Description (optional)
  - Tags (optional, comma-separated)
          ↓
User clicks "Save Template"
          ↓
┌─────────────────────────────────────┐
│ emailStore.saveEmailAsTemplate()    │
├─────────────────────────────────────┤
│ 1. Clone current email.blocks       │
│ 2. Clone current email.settings     │
│ 3. Generate thumbnail (HTML → PNG)  │
│ 4. Create UserTemplate object       │
│ 5. Add to userTemplates array       │
│ 6. Persist to localStorage          │
│ 7. Show success toast               │
└─────────────────────────────────────┘
          ↓
Template appears in Template Library
with "My Template" badge
```

#### 3.4.2 Load User Template

```
User browses Template Library
          ↓
User filters by "My Templates"
          ↓
User clicks template thumbnail
          ↓
PreviewModal opens showing full preview
          ↓
User clicks "Use This Template"
          ↓
Confirmation: "Replace current email?"
          ↓
User confirms
          ↓
┌─────────────────────────────────────┐
│ emailStore.loadUserTemplate(id)     │
├─────────────────────────────────────┤
│ 1. Find template by ID              │
│ 2. Clone template.blocks            │
│ 3. Add order property to blocks     │
│ 4. Load template.settings           │
│ 5. Clear history buffer             │
│ 6. Update email state               │
│ 7. Set activeSidebarTab to 'content'│
│ 8. Show success toast               │
└─────────────────────────────────────┘
          ↓
Canvas updates with template content
User can now edit
```

#### 3.4.3 Edit Template Metadata

```
User hovers over template card
          ↓
"Edit" icon appears (pencil)
          ↓
User clicks edit icon
          ↓
EditTemplateDialog opens
          ↓
User updates:
  - Name
  - Category
  - Description
  - Tags
  - Thumbnail (optional re-generate)
          ↓
User clicks "Save Changes"
          ↓
┌─────────────────────────────────────┐
│ emailStore.updateUserTemplate()     │
├─────────────────────────────────────┤
│ 1. Find template by ID              │
│ 2. Update metadata fields           │
│ 3. Update updatedAt timestamp       │
│ 4. Persist to localStorage          │
│ 5. Show success toast               │
└─────────────────────────────────────┘
          ↓
Template card updates in library
```

---

## 4. Data Model Design

### 4.1 UserTemplate Interface

**Location**: `/src/types/template.ts` (NEW)

```typescript
/**
 * User-created template (stored in localStorage)
 */
export interface UserTemplate {
  id: string                    // nanoid()
  name: string                  // User-defined name
  description?: string          // Optional description
  category: TemplateCategory    // Category enum
  tags: string[]               // Searchable tags

  // Email content
  blocks: Omit<EmailBlock, 'order'>[]  // Template blocks (order added at load time)
  settings: TemplateSettings           // Email settings (colors, fonts, etc.)

  // Metadata
  thumbnail: string            // Base64 PNG or data URL
  thumbnailGeneratedAt: Date   // When thumbnail was created

  // Timestamps
  createdAt: Date              // When template was first saved
  updatedAt: Date              // When template was last modified
  lastUsedAt?: Date            // When template was last loaded (for sorting)

  // Source tracking
  source: 'user' | 'imported'  // How template was created
  version: number              // Template schema version (for future migrations)

  // Usage statistics (optional, for future analytics)
  useCount?: number            // How many times template was loaded
}

/**
 * Template category enum (expanded from current categories)
 */
export type TemplateCategory =
  | 'newsletter'      // Regular newsletters
  | 'promotion'       // Sales, discounts, offers
  | 'transactional'   // Receipts, confirmations
  | 'announcement'    // Company news, updates
  | 'event'           // Event invitations, reminders
  | 'content'         // Blog posts, articles
  | 'retention'       // Re-engagement, win-back
  | 'seasonal'        // Holiday, seasonal campaigns (NEW)
  | 'welcome'         // Onboarding sequences (NEW)
  | 'custom'          // User-defined (NEW)

/**
 * Template filter/search criteria
 */
export interface TemplateFilters {
  source?: 'all' | 'system' | 'user' | 'imported'
  category?: TemplateCategory | 'all'
  searchQuery?: string          // Search in name, description, tags
  tags?: string[]              // Filter by specific tags
  sortBy: 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'name' | 'useCount'
  sortOrder: 'asc' | 'desc'
}
```

### 4.2 Template Storage Schema

**localStorage Key Structure**:

```typescript
// Key: 'email-designer-user-templates'
// Value: JSON string of UserTemplate[]

{
  templates: [
    {
      id: "tpl_abc123",
      name: "Monthly Newsletter - Tech Focus",
      description: "Standard newsletter layout with hero image, 3 articles, and CTA",
      category: "newsletter",
      tags: ["tech", "monthly", "blog"],
      blocks: [...],              // Array of email blocks (no order property)
      settings: {...},            // Email settings
      thumbnail: "data:image/png;base64,...",  // Base64 thumbnail
      thumbnailGeneratedAt: "2025-12-26T10:30:00Z",
      createdAt: "2025-12-20T14:22:00Z",
      updatedAt: "2025-12-26T10:30:00Z",
      lastUsedAt: "2025-12-26T09:15:00Z",
      source: "user",
      version: 1,
      useCount: 5
    },
    // ... more templates
  ],
  version: 1,                    // Schema version for migrations
  lastModified: "2025-12-26T10:30:00Z"
}
```

**Storage Size Considerations**:

localStorage has 5-10MB limit per domain. Estimates:
- Average email: 50-100 KB (blocks + settings)
- Thumbnail (compressed PNG): 20-50 KB
- **Average template**: ~100-150 KB
- **Realistic capacity**: 30-50 user templates

**Mitigation strategies**:
1. Compress thumbnails (reduce quality, smaller dimensions)
2. Implement template archiving (move old templates to exported files)
3. Add storage usage indicator in UI
4. Future: Cloud sync for unlimited storage

### 4.3 Template Metadata Standards

**Naming Conventions**:
- Max length: 100 characters
- Required field
- No profanity filter (trust users)
- Trim whitespace
- Suggest format: "[Type] - [Purpose]" e.g., "Newsletter - Product Updates"

**Description Best Practices**:
- Max length: 500 characters
- Optional but recommended
- Markdown support (future enhancement)
- Suggest: "Best for...", "Includes...", "Use when..."

**Category Guidelines**:
- Single category per template (no multi-category initially)
- Default to 'custom' if unsure
- Show example templates for each category (onboarding)

**Tag Recommendations**:
- Max 10 tags per template
- Lowercase, alphanumeric + hyphens
- Comma-separated input
- Auto-suggest based on:
  - Category (auto-add category as tag)
  - Block types (e.g., "gallery", "cta-button")
  - Colors used (e.g., "blue-theme", "dark-mode")
  - Industry (future: ML-based suggestions)

### 4.4 Thumbnail Generation Strategy

**Approach**: HTML Canvas → PNG Data URL

**Technical Implementation**:
```typescript
/**
 * Generate template thumbnail from email blocks
 * Uses html-to-image library or native canvas API
 */
async function generateTemplateThumbnail(
  email: EmailDocument
): Promise<string> {
  // 1. Render email HTML (same as preview)
  const html = generateEmailHTML(email, false)

  // 2. Create temporary DOM element
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.width = '640px'
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  document.body.appendChild(container)

  // 3. Convert to canvas using html2canvas or dom-to-image
  const canvas = await html2canvas(container, {
    width: 640,
    scale: 0.5,  // Reduce resolution for smaller file size
    backgroundColor: '#ffffff'
  })

  // 4. Convert canvas to PNG data URL
  const dataUrl = canvas.toDataURL('image/png', 0.7)  // 70% quality

  // 5. Cleanup
  document.body.removeChild(container)

  // 6. Return base64 string
  return dataUrl
}
```

**Thumbnail Dimensions**:
- Source: 640px width (email width)
- Scale: 0.5x (320px thumbnail)
- Aspect ratio: Maintain original (variable height based on content)
- Max height: 600px (cap for very long emails)

**Optimization**:
- PNG quality: 70% (balance between size and clarity)
- Lazy generation: Only generate when saving template
- Re-generation: Optional "Update thumbnail" button in edit dialog
- Fallback: Placeholder SVG if generation fails

**Dependencies**:
- Library: `html2canvas` (already used for preview/export?)
- Alternative: `dom-to-image-more` (smaller bundle size)

---

## 5. UI/UX Flow Design

### 5.1 Save Email as Template Flow

**Entry Points**:
1. **Primary**: Top nav "Save as Template" button (next to Export HTML)
2. **Secondary**: Keyboard shortcut `Cmd/Ctrl + Shift + S`
3. **Context menu**: Right-click canvas → "Save as Template"

**SaveTemplateDialog Component**:

```
┌────────────────────────────────────────────┐
│  Save Email as Template                 ×  │
├────────────────────────────────────────────┤
│                                            │
│  Template Name *                           │
│  ┌──────────────────────────────────────┐ │
│  │ Monthly Newsletter                    │ │
│  └──────────────────────────────────────┘ │
│  Character count: 18/100                   │
│                                            │
│  Category *                                │
│  ┌──────────────────────────────────────┐ │
│  │ Newsletter              ▼             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Description (Optional)                    │
│  ┌──────────────────────────────────────┐ │
│  │ Standard monthly newsletter with     │ │
│  │ hero image, 3 article sections, and  │ │
│  │ call-to-action button.               │ │
│  └──────────────────────────────────────┘ │
│  Character count: 89/500                   │
│                                            │
│  Tags (comma-separated)                    │
│  ┌──────────────────────────────────────┐ │
│  │ monthly, blog, tech                   │ │
│  └──────────────────────────────────────┘ │
│  💡 Tip: Add tags to find this template  │
│     later (e.g., "monthly", "holiday")    │
│                                            │
│  ┌────────────────────────────────────┐  │
│  │ Preview                             │  │
│  │ ┌────────────────────────────────┐ │  │
│  │ │ [Thumbnail preview - 320x400]  │ │  │
│  │ │                                 │ │  │
│  │ └────────────────────────────────┘ │  │
│  │ Thumbnail will be auto-generated   │  │
│  └────────────────────────────────────┘  │
│                                            │
│  ┌─────────────────┐  ┌─────────────────┐│
│  │     Cancel      │  │  Save Template  ││
│  └─────────────────┘  └─────────────────┘│
└────────────────────────────────────────────┘
```

**Validation Rules**:
- Template name: Required, 1-100 chars
- Category: Required selection
- Description: Optional, max 500 chars
- Tags: Optional, max 10 tags, alphanumeric + hyphens
- No duplicate names (show warning if name exists)

**Success Flow**:
1. Show loading spinner during thumbnail generation (1-2 seconds)
2. Close dialog
3. Show toast: "Template saved successfully! ✓"
4. Auto-switch to Templates tab in sidebar
5. Scroll to new template (highlight with animation)

**Error Handling**:
- Thumbnail generation fails → Use placeholder SVG, save anyway
- localStorage full → Show error, suggest deleting old templates
- Validation errors → Highlight fields in red with error messages

### 5.2 Enhanced Template Library

**Tab Organization**:

```
┌────────────────────────────────────────────┐
│  Templates                              ×  │
├────────────────────────────────────────────┤
│                                            │
│  [All Templates] [System] [My Templates]   │
│     (active)                                │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  🔍 Search templates...              │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Category: [All ▼]  Sort: [Recent ▼]      │
│                                            │
│  Tags: [Filter by tags ▼]                 │
│  ┌────────────────────────────────────┐   │
│  │ × monthly  × newsletter  × tech     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ─── My Templates (5) ───                  │
│                                            │
│  ┌─────────────┐  ┌─────────────┐         │
│  │ [Thumbnail] │  │ [Thumbnail] │         │
│  │             │  │             │         │
│  │ Monthly     │  │ Product     │         │
│  │ Newsletter  │  │ Launch      │         │
│  │             │  │             │         │
│  │ 🏷️ newsletter│ │ 🏷️ promotion│        │
│  │ Used 5x     │  │ Used 2x     │         │
│  │ 2 days ago  │  │ 1 week ago  │         │
│  │             │  │             │         │
│  │ [👁️ View]   │  │ [👁️ View]   │         │
│  │ [...More]   │  │ [...More]   │         │
│  └─────────────┘  └─────────────┘         │
│                                            │
│  ─── System Templates (8) ───              │
│                                            │
│  ┌─────────────┐  ┌─────────────┐         │
│  │ [Thumbnail] │  │ [Thumbnail] │         │
│  │             │  │             │         │
│  │ Welcome     │  │ Newsletter  │         │
│  │ Email       │  │             │         │
│  │ ⭐ Official │  │ ⭐ Official │         │
│  │             │  │             │         │
│  │ [👁️ View]   │  │ [👁️ View]   │         │
│  └─────────────┘  └─────────────┘         │
│                                            │
└────────────────────────────────────────────┘
```

**Template Card Actions** (More menu):
- "Use Template" - Loads template
- "Edit Details" - Opens edit dialog (user templates only)
- "Duplicate" - Creates copy
- "Export JSON" - Downloads template file
- "Delete" - Removes template (with confirmation)

**Filter/Sort Options**:

**Source Tabs**:
- All Templates (system + user)
- System Templates (built-in only)
- My Templates (user-created only)

**Category Dropdown**:
- All, Newsletter, Promotion, Transactional, Announcement, Event, Content, Retention, Seasonal, Welcome, Custom

**Sort Dropdown**:
- Recently Used (lastUsedAt DESC)
- Recently Created (createdAt DESC)
- Recently Updated (updatedAt DESC)
- Name (A-Z)
- Name (Z-A)
- Most Used (useCount DESC)

**Search**:
- Searches: name, description, tags
- Real-time filtering
- Highlights matching text

**Tag Filter**:
- Multi-select dropdown
- Shows all unique tags from user templates
- Displays tag count (e.g., "monthly (3)")

### 5.3 Template Preview Modal

**Enhancement to existing PreviewModal**:

Add template metadata display:

```
┌────────────────────────────────────────────────┐
│  Monthly Newsletter                         ×  │
├────────────────────────────────────────────────┤
│                                                │
│  📄 Newsletter • Created Dec 20, 2025          │
│  🏷️ Tags: monthly, blog, tech                 │
│  📝 Standard monthly newsletter with hero      │
│     image, 3 article sections, and CTA         │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │                                           │ │
│  │  [Email Preview - Scrollable]            │ │
│  │                                           │ │
│  │  (Existing PreviewModal content)          │ │
│  │                                           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ ← Back       │  │  Use This Template   │  │
│  └──────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────┘
```

### 5.4 Edit Template Dialog

**For user templates only** (system templates are immutable):

```
┌────────────────────────────────────────────┐
│  Edit Template                          ×  │
├────────────────────────────────────────────┤
│                                            │
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
│  Tags                                      │
│  ┌──────────────────────────────────────┐ │
│  │ monthly, blog, tech                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Thumbnail                                 │
│  ┌────────────────────────────────────┐  │
│  │ [Current thumbnail preview]         │  │
│  │                                      │  │
│  └────────────────────────────────────┘  │
│  ┌──────────────────────────────────┐    │
│  │  🔄 Regenerate Thumbnail          │    │
│  └──────────────────────────────────┘    │
│  ⚠️ Warning: This will update the         │
│     thumbnail with the current email      │
│     content (if different from template)  │
│                                            │
│  ┌─────────────────┐  ┌─────────────────┐│
│  │     Cancel      │  │  Save Changes   ││
│  └─────────────────┘  └─────────────────┘│
└────────────────────────────────────────────┘
```

**Note**: "Regenerate Thumbnail" uses current canvas content, not the template's original content. This allows updating the thumbnail if template was loaded and edited.

### 5.5 Delete Template Confirmation

**Modal dialog**:

```
┌────────────────────────────────────────┐
│  Delete Template?                      │
├────────────────────────────────────────┤
│                                        │
│  Are you sure you want to delete       │
│  "Monthly Newsletter"?                 │
│                                        │
│  This action cannot be undone.         │
│                                        │
│  💡 Tip: You can export this template  │
│  as JSON before deleting to keep a     │
│  backup.                               │
│                                        │
│  ┌────────────┐  ┌──────────────────┐ │
│  │   Cancel   │  │  Delete Template │ │
│  └────────────┘  └──────────────────┘ │
│                       (Red button)     │
└────────────────────────────────────────┘
```

### 5.6 Empty States

**My Templates (Empty)**:

```
┌────────────────────────────────────────┐
│                                        │
│           📄                           │
│                                        │
│     No templates saved yet             │
│                                        │
│  Create your first template by        │
│  clicking "Save as Template" in        │
│  the top navigation.                   │
│                                        │
│  Templates are great for:              │
│  • Reusing common email layouts        │
│  • Maintaining brand consistency       │
│  • Speeding up email creation          │
│                                        │
└────────────────────────────────────────┘
```

### 5.7 Storage Warning

**When approaching localStorage limit** (>80% full):

```
┌────────────────────────────────────────┐
│  ⚠️ Storage Almost Full                │
├────────────────────────────────────────┤
│                                        │
│  You've used 4.2 MB of 5 MB available  │
│  storage.                              │
│                                        │
│  Consider:                             │
│  • Deleting unused templates           │
│  • Exporting templates as JSON files   │
│  • Archiving old templates             │
│                                        │
│  [View Storage Details]  [Dismiss]     │
└────────────────────────────────────────┘
```

---

## 6. Storage Strategy

### 6.1 localStorage Implementation

**Storage Keys**:

```typescript
const STORAGE_KEYS = {
  EMAIL: 'email-designer-state',              // Current email (existing)
  SAVED_COMPONENTS: 'email-designer-saved-components',  // Components (existing)
  USER_TEMPLATES: 'email-designer-user-templates',     // User templates (NEW)
  TEMPLATE_SETTINGS: 'email-designer-template-settings', // UI preferences (NEW)
}
```

**Storage Functions** (add to `/src/lib/storage.ts`):

```typescript
/**
 * User template storage functions
 */

export function loadUserTemplatesFromStorage(): UserTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_TEMPLATES)
    if (!stored) return []

    const data = JSON.parse(stored)

    // Deserialize dates
    return data.templates.map((tpl: any) => ({
      ...tpl,
      createdAt: new Date(tpl.createdAt),
      updatedAt: new Date(tpl.updatedAt),
      lastUsedAt: tpl.lastUsedAt ? new Date(tpl.lastUsedAt) : undefined,
      thumbnailGeneratedAt: new Date(tpl.thumbnailGeneratedAt),
    }))
  } catch (error) {
    console.error('Failed to load user templates:', error)
    return []
  }
}

export function saveUserTemplatesToStorage(templates: UserTemplate[]): void {
  try {
    const data = {
      templates: templates.map(tpl => ({
        ...tpl,
        createdAt: tpl.createdAt.toISOString(),
        updatedAt: tpl.updatedAt.toISOString(),
        lastUsedAt: tpl.lastUsedAt?.toISOString(),
        thumbnailGeneratedAt: tpl.thumbnailGeneratedAt.toISOString(),
      })),
      version: 1,
      lastModified: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEYS.USER_TEMPLATES, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save user templates:', error)
    throw new Error('Storage quota exceeded. Please delete some templates.')
  }
}

export function exportTemplateJSON(template: UserTemplate): void {
  try {
    const json = JSON.stringify(template, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export template:', error)
  }
}

export function importTemplateJSON(file: File): Promise<UserTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        // Validate template structure
        const template = validateUserTemplate(data)

        // Ensure unique ID and update timestamps
        template.id = nanoid()
        template.source = 'imported'
        template.createdAt = new Date()
        template.updatedAt = new Date()
        template.lastUsedAt = undefined
        template.useCount = 0

        resolve(template)
      } catch (error) {
        reject(new Error('Invalid template JSON file'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Get storage usage information
 */
export function getStorageUsage(): {
  used: number      // Bytes used
  total: number     // Total bytes available
  percentage: number
} {
  const total = 5 * 1024 * 1024  // 5 MB (conservative estimate)
  let used = 0

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length
    }
  }

  return {
    used,
    total,
    percentage: (used / total) * 100
  }
}
```

### 6.2 Data Migration Strategy

**Schema Versioning**:

Every template has a `version` field. If we change the template structure in the future, we'll need migration logic.

```typescript
/**
 * Migrate templates from old schema to new schema
 */
export function migrateUserTemplates(templates: any[]): UserTemplate[] {
  return templates.map(tpl => {
    const version = tpl.version || 1

    // Version 1 → 2 migration (example)
    if (version === 1) {
      // Add new fields introduced in version 2
      tpl.useCount = 0
      tpl.lastUsedAt = undefined
      tpl.version = 2
    }

    // Future migrations would go here

    return tpl
  })
}
```

**Backward Compatibility**:
- Always include `version` field
- Never remove fields (deprecate instead)
- Add migration logic before breaking changes
- Test migrations with real user data

### 6.3 Future: Cloud Sync

**Phase 4 Enhancement** (not in MVP):

**Architecture**:
```
localStorage (Local) ←→ Cloud Database (Firebase/Supabase)
                    ↑
              Sync Engine
                    ↓
         Conflict Resolution
```

**Sync Strategy**:
- **Last-write-wins**: Simple conflict resolution
- **Sync on action**: Save template → upload to cloud
- **Background sync**: Periodic pull from cloud
- **Offline-first**: All operations work offline, sync when online

**Benefits**:
- Access templates from any device
- Unlimited storage
- Backup/restore
- Template sharing (share link to template ID)

---

## 7. Migration Path

### 7.1 From Current State to Phase 1

**No breaking changes required** because:
- System templates remain unchanged (static JSON files)
- SavedComponent system untouched
- New features additive (userTemplates array)

**Migration Steps**:

1. **Add UserTemplate types** to `/src/types/template.ts`
2. **Add storage functions** to `/src/lib/storage.ts`
3. **Add store state** to `/src/stores/emailStore.ts`:
   - `userTemplates: UserTemplate[]`
4. **Add store actions** to `/src/stores/emailStore.ts`:
   - `saveEmailAsTemplate()`
   - `loadUserTemplate()`
   - `updateUserTemplate()`
   - `deleteUserTemplate()`
   - `duplicateUserTemplate()`
5. **Create new components**:
   - `SaveTemplateDialog.tsx`
   - `EditTemplateDialog.tsx`
   - `TemplateCard.tsx` (refactor from TemplateLibrary)
6. **Enhance TemplateLibrary.tsx**:
   - Add source tabs (All, System, My Templates)
   - Add filters (category, tags, search)
   - Add sort options
   - Display user templates alongside system templates
7. **Add thumbnail generation**:
   - Install `html2canvas` dependency
   - Implement `generateTemplateThumbnail()` utility
8. **Add TopNav button**: "Save as Template"

**Testing**:
- Create template → Verify localStorage
- Load template → Verify blocks loaded correctly
- Edit template metadata → Verify updates persisted
- Delete template → Verify removed from storage
- Export/import template → Verify JSON portability
- Storage quota → Test with many large templates

### 7.2 Data Migration for Existing Users

**Scenario**: User has existing saved email in localStorage

**No migration needed** because:
- Current email storage key unchanged
- User templates stored in separate key
- No conflicts between systems

**Edge case handling**:
- If user has 20+ saved components, warn about storage before saving first template
- If localStorage corrupted, gracefully handle with error messages

---

## 8. Implementation Phases

### Phase 1: Core User Templates (MVP) - 2-3 days

**Goal**: Enable users to save current email as template and load it later

**Deliverables**:
1. ✅ UserTemplate data model
2. ✅ localStorage storage functions
3. ✅ emailStore actions (save, load, delete)
4. ✅ SaveTemplateDialog component
5. ✅ Enhanced TemplateLibrary with user templates
6. ✅ Thumbnail generation (basic quality)
7. ✅ Template loading flow
8. ✅ Delete confirmation

**Features**:
- Save current email as template
- Name, category, description, tags
- Auto-generated thumbnail
- Load user template
- Delete user template
- Filter by source (All, System, My Templates)

**Acceptance Criteria**:
- User can save email with metadata
- Template appears in library immediately
- Template loads correctly (blocks + settings)
- Thumbnail displays in grid
- User can delete template with confirmation
- Templates persist across page refresh

**Files to Create**:
- `/src/types/template.ts` - Add UserTemplate interface
- `/src/components/ui/SaveTemplateDialog.tsx` - Save dialog
- `/src/components/ui/TemplateCard.tsx` - Card component
- `/src/lib/thumbnailGenerator.ts` - Thumbnail utility

**Files to Modify**:
- `/src/stores/emailStore.ts` - Add userTemplates state + actions
- `/src/lib/storage.ts` - Add template storage functions
- `/src/components/layout/TemplateLibrary.tsx` - Add user templates display
- `/src/components/layout/TopNav.tsx` - Add "Save as Template" button

**Dependencies**:
- `html2canvas` - For thumbnail generation
- `nanoid` - Already installed

**Testing Checklist**:
- [ ] Save template with all metadata fields
- [ ] Save template with minimal fields (name + category only)
- [ ] Load template - verify blocks rendered correctly
- [ ] Load template - verify settings applied
- [ ] Delete template - verify removed from UI and storage
- [ ] Page refresh - verify templates persist
- [ ] Multiple templates - verify all display in grid
- [ ] Thumbnail quality - verify legible at 320px width

---

### Phase 2: Template Organization & Editing - 1-2 days

**Goal**: Add filtering, sorting, search, and template editing

**Deliverables**:
1. ✅ Template filters (category, tags)
2. ✅ Template search (name, description, tags)
3. ✅ Template sorting (date, name, usage)
4. ✅ EditTemplateDialog component
5. ✅ Duplicate template action
6. ✅ Export template JSON
7. ✅ Import template JSON

**Features**:
- Filter by category
- Filter by tags (multi-select)
- Search templates
- Sort by: recent, name, most used
- Edit template metadata
- Duplicate template
- Export template as JSON
- Import template from JSON

**Acceptance Criteria**:
- Filters work in real-time
- Search highlights matching text
- Sorting reorders grid correctly
- Edit dialog pre-fills current values
- Duplicate creates copy with "(Copy)" suffix
- Export downloads JSON file
- Import validates and adds template

**Files to Create**:
- `/src/components/ui/EditTemplateDialog.tsx` - Edit dialog
- `/src/components/ui/TemplateFilters.tsx` - Filter controls
- `/src/components/ui/TemplateSearch.tsx` - Search bar

**Files to Modify**:
- `/src/stores/emailStore.ts` - Add update, duplicate actions
- `/src/lib/storage.ts` - Add import/export functions
- `/src/components/layout/TemplateLibrary.tsx` - Add filters/search
- `/src/components/ui/TemplateCard.tsx` - Add edit/duplicate/export actions

**Testing Checklist**:
- [ ] Filter by each category - verify correct templates shown
- [ ] Filter by tags - verify multi-select works
- [ ] Search "newsletter" - verify matches name/description/tags
- [ ] Sort by date - verify newest first
- [ ] Sort by name - verify alphabetical
- [ ] Edit template - verify metadata updates
- [ ] Duplicate template - verify copy created
- [ ] Export template - verify valid JSON downloaded
- [ ] Import template - verify added to library

---

### Phase 3: Template Versioning & Advanced Features - 2-3 days

**Goal**: Add version history, bulk operations, and storage management

**Deliverables**:
1. ✅ Template version history
2. ✅ Restore previous version
3. ✅ Bulk delete templates
4. ✅ Bulk export templates
5. ✅ Storage usage indicator
6. ✅ Template archiving (export old templates)
7. ✅ Template usage analytics

**Features**:
- Save template with version history
- View template version history
- Restore previous version
- Select multiple templates (checkbox mode)
- Bulk delete selected templates
- Bulk export selected templates
- ~~Storage usage meter in UI~~ REMOVED (cloud storage planned)
- Auto-archive old templates (optional)
- Track template usage stats (useCount, lastUsedAt)

**Acceptance Criteria**:
- Template versions saved automatically on update
- Version history shows timestamps and changes
- Restore version creates new current version
- Bulk operations work on 2+ templates
- ~~Storage meter shows accurate percentage~~ REMOVED (cloud storage planned)
- Auto-archive suggests templates to export (optional)

**Files to Create**:
- `/src/components/ui/TemplateVersionHistory.tsx` - Version history modal
- ~~`/src/components/ui/StorageUsageMeter.tsx`~~ REMOVED (cloud storage planned)
- `/src/components/ui/BulkTemplateActions.tsx` - Bulk action toolbar

**Files to Modify**:
- `/src/stores/emailStore.ts` - Add versioning logic
- `/src/lib/storage.ts` - Add bulk operations, storage meter
- `/src/components/layout/TemplateLibrary.tsx` - Add bulk selection mode

**Testing Checklist**:
- [ ] Update template - verify version saved
- [ ] View version history - verify all versions listed
- [ ] Restore version - verify content reverted
- [ ] Select 3 templates - verify bulk toolbar appears
- [ ] Bulk delete 2 templates - verify removed
- [ ] Bulk export 3 templates - verify ZIP downloaded
- ~~Storage meter~~ REMOVED (cloud storage planned)
- [ ] Auto-archive - verify oldest templates suggested (optional)

---

### Phase 4: Template Sharing & Marketplace - 3-5 days (FUTURE)

**Goal**: Enable template sharing and community marketplace

**Deliverables**:
1. ✅ Share template (generate shareable link)
2. ✅ Import shared template
3. ✅ Community template gallery
4. ✅ Template ratings/reviews
5. ✅ Template submission/approval flow
6. ✅ Cloud sync (Firebase/Supabase)

**Features**:
- Generate shareable link for template
- Import template from shared link
- Browse community templates
- Rate/review templates
- Submit template to community
- Sync templates across devices (cloud)

**Acceptance Criteria**:
- Share link opens preview + import option
- Imported template appears in "Imported" section
- Community gallery shows approved templates
- Users can rate templates (1-5 stars)
- Submitted templates pending approval
- Cloud sync keeps templates in sync across devices

**Infrastructure Required**:
- Backend API (Node.js/Express or serverless)
- Database (PostgreSQL/MongoDB)
- Authentication (Auth0/Firebase Auth)
- CDN for thumbnails (Cloudinary)
- Moderation tools (admin dashboard)

**Timeline**: 1-2 weeks (separate project)

---

## 9. Technical Specifications

### 9.1 Thumbnail Generation

**Library**: `html2canvas` v1.4.1

**Installation**:
```bash
npm install html2canvas
```

**Implementation** (`/src/lib/thumbnailGenerator.ts`):

```typescript
import html2canvas from 'html2canvas'
import { generateEmailHTML } from './htmlGenerator'
import type { EmailDocument } from '@/types/email'

/**
 * Generate thumbnail from email document
 * Returns base64 PNG data URL
 */
export async function generateTemplateThumbnail(
  email: EmailDocument
): Promise<string> {
  try {
    // 1. Generate email HTML
    const html = generateEmailHTML(email, false)

    // 2. Create temporary container
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.width = '640px'
    container.style.position = 'absolute'
    container.style.left = '-10000px'
    container.style.top = '0'
    document.body.appendChild(container)

    // 3. Wait for images to load
    await waitForImages(container)

    // 4. Generate canvas
    const canvas = await html2canvas(container, {
      width: 640,
      scale: 0.5,        // 320px thumbnail width
      useCORS: true,     // For external images
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 640,
    })

    // 5. Convert to PNG data URL (70% quality)
    const dataUrl = canvas.toDataURL('image/png', 0.7)

    // 6. Cleanup
    document.body.removeChild(container)

    return dataUrl
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
    // Return placeholder SVG
    return generatePlaceholderThumbnail()
  }
}

/**
 * Wait for all images in container to load
 */
function waitForImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img')
  const promises = Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(null)
      } else {
        img.onload = () => resolve(null)
        img.onerror = () => resolve(null)  // Resolve even on error
      }
    })
  })

  return Promise.all(promises).then(() => {})
}

/**
 * Generate placeholder thumbnail (SVG)
 */
function generatePlaceholderThumbnail(): string {
  const svg = `
    <svg width="320" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="400" fill="#f3f4f6"/>
      <text x="160" y="200" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af">
        Preview unavailable
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}
```

**Performance Optimization**:
- Only generate on save (not on every edit)
- Debounce if regenerating thumbnail
- Use web worker for generation (future enhancement)
- Cache thumbnails in localStorage

**Error Handling**:
- CORS issues → Use placeholder
- Timeout (>5s) → Use placeholder
- Out of memory → Reduce scale to 0.3

### 9.2 Store Actions

**Add to `/src/stores/emailStore.ts`**:

```typescript
interface EmailStore {
  // ... existing properties

  // User Templates State
  userTemplates: UserTemplate[]

  // User Template Actions
  saveEmailAsTemplate: (
    name: string,
    category: TemplateCategory,
    description?: string,
    tags?: string[]
  ) => Promise<void>

  loadUserTemplate: (templateId: string) => void

  updateUserTemplate: (
    templateId: string,
    updates: Partial<UserTemplate>
  ) => void

  deleteUserTemplate: (templateId: string) => void

  duplicateUserTemplate: (templateId: string) => UserTemplate

  getUserTemplates: () => UserTemplate[]

  filterUserTemplates: (filters: TemplateFilters) => UserTemplate[]

  exportUserTemplate: (templateId: string) => void

  importUserTemplate: (file: File) => Promise<void>
}
```

**Implementation**:

```typescript
import { generateTemplateThumbnail } from '@/lib/thumbnailGenerator'
import {
  loadUserTemplatesFromStorage,
  saveUserTemplatesToStorage,
  exportTemplateJSON,
  importTemplateJSON
} from '@/lib/storage'

export const useEmailStore = create<EmailStore>((set, get) => ({
  // ... existing state

  userTemplates: loadUserTemplatesFromStorage(),

  // Save current email as template
  saveEmailAsTemplate: async (name, category, description, tags) => {
    const state = get()

    try {
      // 1. Generate thumbnail
      const thumbnail = await generateTemplateThumbnail(state.email)

      // 2. Clone blocks (remove order property)
      const blocks = state.email.blocks.map(({ order, ...block }) => block)

      // 3. Create template object
      const template: UserTemplate = {
        id: nanoid(),
        name,
        category,
        description,
        tags: tags || [],
        blocks,
        settings: state.email.settings,
        thumbnail,
        thumbnailGeneratedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'user',
        version: 1,
        useCount: 0,
      }

      // 4. Add to state
      const newTemplates = [...state.userTemplates, template]
      set({ userTemplates: newTemplates })

      // 5. Persist to localStorage
      saveUserTemplatesToStorage(newTemplates)

      // 6. Show success message
      if (typeof window !== 'undefined') {
        toast.success(`Template "${name}" saved successfully!`)
      }
    } catch (error: any) {
      console.error('Failed to save template:', error)
      if (typeof window !== 'undefined') {
        toast.error(error.message || 'Failed to save template')
      }
    }
  },

  // Load user template
  loadUserTemplate: (templateId) => {
    const state = get()
    const template = state.userTemplates.find(t => t.id === templateId)

    if (!template) {
      console.error('Template not found:', templateId)
      return
    }

    try {
      // 1. Add order property to blocks
      const blocksWithOrder = template.blocks.map((block, index) => ({
        ...block,
        order: index
      })) as EmailBlock[]

      // 2. Reset history buffer
      state.historyBuffer.clear()
      state.historyBuffer.push(blocksWithOrder)

      // 3. Update email state
      set({
        email: {
          ...state.email,
          title: template.name,
          blocks: blocksWithOrder,
          settings: {
            ...state.email.settings,
            ...template.settings,
          },
          updatedAt: new Date(),
        },
        editorState: {
          selectedBlockId: null,
          editingBlockId: null,
          editingType: null,
          draggedBlockId: null,
          selectedGalleryImageIndex: 0,
          viewport: { mode: 'mobile', zoom: 120 },
          isDirty: true,
          isSaving: false,
          lastSaved: null,
        },
        activeSidebarTab: 'content',
      })

      // 4. Update usage stats
      const updatedTemplates = state.userTemplates.map(t =>
        t.id === templateId
          ? {
              ...t,
              lastUsedAt: new Date(),
              useCount: (t.useCount || 0) + 1
            }
          : t
      )
      set({ userTemplates: updatedTemplates })
      saveUserTemplatesToStorage(updatedTemplates)

      // 5. Show success message
      if (typeof window !== 'undefined') {
        toast.success(`Template "${template.name}" loaded!`)
      }
    } catch (error) {
      console.error('Failed to load template:', error)
      if (typeof window !== 'undefined') {
        toast.error('Failed to load template')
      }
    }
  },

  // Update template metadata
  updateUserTemplate: (templateId, updates) => {
    const state = get()
    const updatedTemplates = state.userTemplates.map(t =>
      t.id === templateId
        ? {
            ...t,
            ...updates,
            updatedAt: new Date()
          }
        : t
    )

    set({ userTemplates: updatedTemplates })
    saveUserTemplatesToStorage(updatedTemplates)

    if (typeof window !== 'undefined') {
      toast.success('Template updated successfully!')
    }
  },

  // Delete template
  deleteUserTemplate: (templateId) => {
    const state = get()
    const template = state.userTemplates.find(t => t.id === templateId)
    const newTemplates = state.userTemplates.filter(t => t.id !== templateId)

    set({ userTemplates: newTemplates })
    saveUserTemplatesToStorage(newTemplates)

    if (typeof window !== 'undefined' && template) {
      toast.success(`Template "${template.name}" deleted`)
    }
  },

  // Duplicate template
  duplicateUserTemplate: (templateId) => {
    const state = get()
    const template = state.userTemplates.find(t => t.id === templateId)

    if (!template) return

    const duplicate: UserTemplate = {
      ...template,
      id: nanoid(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: undefined,
      useCount: 0,
    }

    const newTemplates = [...state.userTemplates, duplicate]
    set({ userTemplates: newTemplates })
    saveUserTemplatesToStorage(newTemplates)

    if (typeof window !== 'undefined') {
      toast.success(`Template duplicated!`)
    }

    return duplicate
  },

  // Get all user templates
  getUserTemplates: () => {
    return get().userTemplates
  },

  // Filter templates
  filterUserTemplates: (filters) => {
    const state = get()
    let filtered = state.userTemplates

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      )
    }

    // Search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'createdAt':
          return filters.sortOrder === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime()

        case 'updatedAt':
          return filters.sortOrder === 'asc'
            ? a.updatedAt.getTime() - b.updatedAt.getTime()
            : b.updatedAt.getTime() - a.updatedAt.getTime()

        case 'lastUsedAt':
          const aTime = a.lastUsedAt?.getTime() || 0
          const bTime = b.lastUsedAt?.getTime() || 0
          return filters.sortOrder === 'asc'
            ? aTime - bTime
            : bTime - aTime

        case 'name':
          return filters.sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)

        case 'useCount':
          const aCount = a.useCount || 0
          const bCount = b.useCount || 0
          return filters.sortOrder === 'asc'
            ? aCount - bCount
            : bCount - aCount

        default:
          return 0
      }
    })

    return filtered
  },

  // Export template
  exportUserTemplate: (templateId) => {
    const state = get()
    const template = state.userTemplates.find(t => t.id === templateId)
    if (template) {
      exportTemplateJSON(template)
    }
  },

  // Import template
  importUserTemplate: async (file) => {
    try {
      const template = await importTemplateJSON(file)
      const state = get()
      const newTemplates = [...state.userTemplates, template]

      set({ userTemplates: newTemplates })
      saveUserTemplatesToStorage(newTemplates)

      if (typeof window !== 'undefined') {
        toast.success(`Template "${template.name}" imported!`)
      }
    } catch (error: any) {
      console.error('Failed to import template:', error)
      if (typeof window !== 'undefined') {
        toast.error(error.message || 'Failed to import template')
      }
    }
  },
}))
```

### 9.3 Component Specifications

**SaveTemplateDialog.tsx** (~200 lines):
- Form with name, category, description, tags
- Real-time character counters
- Category dropdown with icons
- Tags input with comma separation
- Preview thumbnail (loading state)
- Validation errors inline
- Submit disabled until valid
- Loading spinner during save

**EditTemplateDialog.tsx** (~180 lines):
- Similar to SaveTemplateDialog
- Pre-fills existing values
- "Regenerate Thumbnail" button
- Warning about thumbnail regeneration
- Update button (not Save)

**TemplateCard.tsx** (~150 lines):
- Thumbnail image with fallback
- Template name (truncated)
- Category badge
- Tags (max 3 visible, "+ 2 more")
- Usage stats (useCount, lastUsedAt)
- Hover actions: View, Edit, Duplicate, Export, Delete
- Badge for source (Official, My Template, Imported)
- Click thumbnail → Preview modal
- Click "Use Template" → Load template

**Enhanced TemplateLibrary.tsx** (~400 lines):
- Source tabs (All, System, My Templates)
- Search bar
- Filter dropdowns (category, tags)
- Sort dropdown
- Grid layout (2 columns on tablet, 3 on desktop)
- Empty states for each tab
- ~~Storage usage meter~~ REMOVED (cloud storage planned)
- Responsive design

---

## 10. Future Enhancements

### 10.1 AI-Powered Features

**Auto-tagging**:
- Analyze template content to suggest tags
- Use GPT-4 Vision API to identify visual elements
- Suggest category based on layout and content

**Template Recommendations**:
- "Templates similar to this one"
- "Templates you might like" (based on usage)
- "Complete this template" (suggest missing blocks)

**Smart Placeholders**:
- AI-generated placeholder content
- Context-aware suggestions (industry-specific)
- Multi-language placeholder generation

### 10.2 Collaboration Features

**Team Templates**:
- Share templates with team members
- Role-based permissions (viewer, editor, admin)
- Template approval workflow
- Comments on templates

**Template Analytics**:
- Track which templates perform best
- A/B testing framework
- Engagement metrics (open rate, click rate)

### 10.3 Advanced Template Features

**Dynamic Templates**:
- Conditional blocks (show/hide based on data)
- Variable substitution ({{firstName}}, {{companyName}})
- Localization support (multi-language versions)

**Template Marketplace**:
- Browse community templates
- Purchase premium templates
- Sell your templates (creator economy)
- Ratings and reviews

**Template Automation**:
- Schedule template campaigns
- Trigger-based templates (welcome series)
- Integration with CRM (HubSpot, Salesforce)

### 10.4 Performance Optimizations

**Lazy Loading**:
- Load thumbnails on scroll (intersection observer)
- Virtual scrolling for large template libraries
- Progressive image loading (blur-up effect)

**Caching**:
- Service worker for offline access
- Cache thumbnails in IndexedDB
- Pre-generate thumbnails in background

**Compression**:
- Compress thumbnails with WebP (smaller size)
- Delta compression for template versions
- Gzip template JSON before storing

---

## Conclusion

This comprehensive plan provides a clear roadmap for implementing user-created templates. The phased approach ensures we deliver value incrementally while building toward a feature-rich template management system that rivals or exceeds competitor offerings.

**Key Success Metrics**:
- Phase 1: 80%+ users save at least 1 template
- Phase 2: 50%+ users use filters/search regularly
- Phase 3: 30%+ users have 5+ templates saved
- Phase 4: 10%+ users share templates with others

**Next Steps**:
1. Review plan with team
2. Prioritize Phase 1 deliverables
3. Set up project board (GitHub Projects / Linear)
4. Begin implementation (start with data model + storage)
5. Iterate based on user feedback

---

**Sources Referenced**:
- [Beefree Features](https://beefree.io/features)
- [Beefree Review 2025](https://www.fahimai.com/beefree)
- [Stripo Template Management](https://stripo.email/)
- [Stripo Review 2025](https://www.mailmodo.com/guides/stripo-review/)
- [Mailchimp Templates](https://mailchimp.com/features/email-templates/)
- [Mailchimp Help - Templates](https://mailchimp.com/help/create-a-template-with-the-template-builder/)
