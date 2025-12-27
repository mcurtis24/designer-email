# Template Placeholder System Guide

## Overview

The template placeholder system allows templates to display professional stock content in previews while automatically converting to helpful placeholders when loaded for editing.

## How It Works

### 1. Template Structure

Templates now use a **metadata-driven approach** instead of regex pattern matching:

```typescript
{
  "metadata": {
    "id": "template-simple-announcement",
    "version": 1,
    "name": "Simple Announcement",
    "category": "announcement",
    "placeholders": {
      "announcement-heading": {
        "text": "[Announcement Title]"
      },
      "main-content": {
        "content": "<p>Add your announcement details here...</p>"
      },
      "footer-1": {
        "companyName": "[Your Company]",
        "address": "[Your Address]",
        "legalText": "© 2025 [Your Company]. All rights reserved."
      }
    }
  },
  "blocks": [
    {
      "id": "announcement-heading",
      "type": "heading",
      "data": {
        "text": "Important Update"  // Stock content for preview
      }
    },
    {
      "id": "footer-1",
      "type": "footer",
      "data": {
        "companyName": "Your Company",  // Stock content for preview
        "address": "123 Main Street...",
        "legalText": "© 2025 Your Company. All rights reserved."
      }
    }
  ],
  "settings": {
    "subject": "Important Update",
    "preheader": "Please review our service updates",
    "width": 600,  // Industry standard
    "backgroundColor": "#FFFFFF",
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "textColor": "#1F2937"
  }
}
```

### 2. Loading Process

When a template is loaded via `loadTemplate()`:

1. **Validation**: Template structure is validated (`validateTemplate()`)
2. **Placeholder Stripping**: Stock content is replaced with placeholders (`stripToPlaceholders()`)
3. **Order Assignment**: Block order properties are added
4. **State Update**: Email store is updated with placeholder content

### 3. Key Files

#### Type Definitions
- **`src/types/template.ts`** - Template, LegacyTemplate, TemplateMetadata types
- **`src/types/email.ts`** - EmailBlock types and type guards

#### Core Utilities
- **`src/lib/templateValidator.ts`** - Validates template structure, handles errors
- **`src/lib/templatePlaceholders.ts`** - Strips stock content to placeholders
- **`src/lib/utils/cloneUtils.ts`** - Deep cloning with structuredClone()

#### Integration
- **`src/lib/templates/index.ts`** - Template loader with unified metadata access
- **`src/stores/emailStore.ts`** - Integrates validation and stripping in loadTemplate()
- **`src/components/layout/TemplateLibrary.tsx`** - Displays templates (works with both formats)

## Benefits

### 1. **Type-Safe**
- Uses existing type guards from `types/email.ts`
- Full TypeScript support with proper inference
- Compile-time error detection

### 2. **Scalable**
- No regex patterns to maintain
- Works with 100+ templates
- Easy to add new block types

### 3. **Maintainable**
- Explicit placeholder mappings per template
- Clear separation of stock content vs placeholders
- Self-documenting structure

### 4. **Flexible**
- Supports partial placeholders (keep some stock content)
- Template versioning possible
- Backward compatible with legacy templates

### 5. **Reliable**
- Uses `structuredClone()` instead of JSON.parse/stringify
- Comprehensive validation with helpful error messages
- Graceful fallbacks for legacy templates

## Creating a New Template

### Step 1: Define Stock Content & Placeholders

```json
{
  "metadata": {
    "id": "template-my-email",
    "version": 1,
    "name": "My Email Template",
    "category": "promotion",
    "description": "A promotional email template",
    "tags": ["sale", "discount"],
    "placeholders": {
      "hero-heading": {
        "text": "[Sale Headline]"
      },
      "product-image": {
        "src": "",  // Empty = shows empty state
        "alt": "Product image"
      },
      "cta-button": {
        "text": "Shop Now",
        "linkUrl": "https://example.com"
      },
      "footer-block": {
        "companyName": "[Your Company]",
        "address": "[Your Address]"
      }
    }
  },
  "blocks": [
    {
      "id": "hero-heading",
      "type": "heading",
      "data": {
        "level": 1,
        "text": "50% Off Everything!",  // Stock content
        "fontFamily": "Georgia, serif",
        "fontSize": "48px",
        "fontWeight": 700,
        "color": "#DC2626"
      },
      "styles": {
        "padding": { "top": "24px", "right": "24px", "bottom": "24px", "left": "24px" },
        "textAlign": "center"
      }
    }
    // ... more blocks
  ],
  "settings": {
    "subject": "50% Off Everything!",
    "preheader": "Limited time offer",
    "width": 600,
    "backgroundColor": "#FFFFFF",
    "fontFamily": "-apple-system, sans-serif",
    "textColor": "#1F2937"
  }
}
```

### Step 2: Supported Block Types & Placeholder Fields

| Block Type | Placeholder Fields |
|------------|-------------------|
| `heading` | `text` |
| `text` | `content` (HTML string) |
| `image` | `src`, `alt`, `linkUrl` |
| `button` | `text`, `linkUrl` |
| `footer` | `companyName`, `address`, `legalText` |
| `imageGallery` | `image0Src`, `image0Alt`, `image0LinkUrl`, `image1Src`, etc. |
| `layout` | (processes nested children) |
| `spacer`, `divider` | (no placeholders, returned as-is) |

### Step 3: Add Template to Index

```typescript
// src/lib/templates/index.ts
import myEmail from './my-email.json'

export const templates: Template[] = [
  // ... existing templates
  myEmail as Template,
]
```

## Helper Functions

### `generatePlaceholderMappings()`

Auto-generates placeholder mappings for a template:

```typescript
import { generatePlaceholderMappings } from '@/lib/templatePlaceholders'

const blocks = [ /* your blocks */ ]
const mappings = generatePlaceholderMappings(blocks)
// Returns suggested placeholder mappings
```

Useful for:
- Converting legacy templates to modern format
- Quick scaffolding of new templates
- Ensuring all blocks have placeholder definitions

## Backward Compatibility

### Legacy Template Format

Templates without metadata are automatically converted:

```json
{
  "id": "old-template",
  "name": "Old Template",
  "category": "newsletter",
  "blocks": [ /* ... */ ],
  "settings": { /* ... */ }
}
```

The validator detects legacy format and creates empty placeholders, meaning:
- ✅ Template loads successfully
- ❌ NO placeholder stripping (content loads as-is)
- ⚠️ Upgrade to modern format for placeholder support

### Migration Path

1. Add `metadata` wrapper with existing id/name/category
2. Add `placeholders` object with mappings for each block
3. Test with `validateTemplate()` to ensure structure is correct

## Error Handling

The system provides clear error messages:

```typescript
try {
  loadTemplate(template)
} catch (error) {
  // User sees: "Template Error: Template missing required metadata.id"
  // Console shows: Full error details with block ID and field name
}
```

Error types:
- Missing required fields (id, name, blocks, settings)
- Invalid block structure (missing id/type/data)
- Malformed nested layouts
- Type mismatches

## Testing

### Validation Test
```typescript
import { validateTemplate } from '@/lib/templateValidator'

const template = { /* ... */ }
const validated = validateTemplate(template)
// Throws TemplateValidationError if invalid
```

### Placeholder Stripping Test
```typescript
import { stripToPlaceholders } from '@/lib/templatePlaceholders'

const stripped = stripToPlaceholders(template)
// Blocks now have placeholder values instead of stock content
```

## Next Steps

1. **Update remaining 7 templates** - Add metadata structure with placeholders
2. **Preview modal integration** - Show stock content before loading
3. **Self-hosted images** - Add `/public/assets/placeholders/` for stock images
4. **Dark mode** - Add dark mode variants to all templates
5. **More templates** - Expand to 12-16 templates (industry minimum)

## Resources

- Plan: `/Users/home/.claude/plans/stateful-sniffing-engelbart.md`
- Type definitions: `src/types/template.ts`
- Example: `src/lib/templates/simple-announcement.json`
