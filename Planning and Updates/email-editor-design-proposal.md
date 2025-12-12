# Email Editor Design Proposal
## Drag-and-Drop Email Builder with AI Integration

**Version:** 1.1
**Date:** December 5, 2025
**Prepared by:** Design Agent

> **📋 NOTE**: For project updates, change history, and current status, see `PROJECT_CHANGELOG.md`

---

## Executive Summary

This document outlines the comprehensive UX strategy, design specifications, and technical considerations for a modern drag-and-drop email editor. The application prioritizes beautiful, intuitive design while generating perfect, cross-client compatible HTML emails. Drawing inspiration from Canva's approachability, Figma's powerful-yet-accessible controls, and email platform best practices, this editor will deliver a friction-free experience for creating professional email campaigns.

**Key Design Principles:**
- Mobile-first thinking (70%+ of emails open on mobile devices)
- Simplicity without sacrificing power
- Immediate visual feedback and WYSIWYG accuracy
- Cross-client email compatibility by default
- Architecture designed for future AI integration (feels native, not bolted-on)

---

## Table of Contents

1. [Research Findings & Context](#1-research-findings--context)
2. [User Experience Strategy](#2-user-experience-strategy)
3. [Information Architecture](#3-information-architecture)
4. [Interface Design Specifications](#4-interface-design-specifications)
5. [AI Integration Strategy](#5-ai-integration-strategy)
6. [Email HTML Technical Strategy](#6-email-html-technical-strategy)
7. [Component Architecture & Design System](#7-component-architecture--design-system)
8. [User Flows](#8-user-flows)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Success Metrics](#10-success-metrics)

---

## 1. Research Findings & Context

### 1.1 Email HTML Best Practices (2025)

**Critical Constraints:**
- **Table-based layouts remain mandatory** - Despite modern web development using flexbox/grid, email clients (especially Outlook) require HTML tables for reliable rendering
- **Inline styles only** - External stylesheets and even `<style>` tags are unreliable; all critical CSS must be inline
- **640px optimal width** - Maximum design space while ensuring compatibility with preview panes and mobile devices (scales beautifully on all screen sizes)
- **100KB total size limit** - Gmail clips larger emails
- **Limited CSS support** - No flexbox, grid, positioning, or advanced selectors
- **Outlook uses Word rendering engine** - Requires VML workarounds for background images and special handling

**Mobile-First Requirements:**
- 70%+ of emails open on mobile devices
- Single-column layouts are safest and most readable
- 16px minimum font size for body text
- 44x44px minimum touch target size for buttons
- Images must use `max-width: 100%` and be compressed
- Assume images will be blocked - rely on alt text and HTML structure

**Responsive Design Approach:**
- Media queries work in 75.75% of clients (not desktop Gmail)
- Hybrid coding technique: div-based layouts for modern clients, "ghost tables" for Outlook using conditional comments
- Progressive enhancement: start with single-column mobile, enhance for desktop

### 1.2 Drag-and-Drop UX Patterns

**Essential Interaction Patterns:**
- Clear drop zones with progressive visual feedback (intensifies as dragged item approaches)
- Magnetic snapping to guide placement and reduce precision requirements
- Immediate visual feedback showing the exact result of the drop
- Shadows and elevation to indicate draggable items and active states
- Keyboard accessibility: Spacebar to pick up, Arrow keys to move, Space to drop
- Alternative methods for users who can't drag (click to select, click to place)

**Component Library Patterns:**
- Left sidebar palette with categorized blocks
- Central canvas with live preview
- Right sidebar with contextual design controls
- Instant updates - no "apply" buttons needed

### 1.3 AI Email Editor Capabilities

**High-Value AI Features (Research-Based):**
- **Subject line generation** - Can achieve 30-45% higher open rates
- **Content generation** - First drafts based on campaign goals and brand voice
- **Personalization at scale** - Dynamic content based on recipient data
- **A/B test suggestions** - Recommends variations to test
- **Copy optimization** - Improves clarity, tone, and call-to-action effectiveness
- **Smart send time prediction** - Analyzes engagement patterns
- **Design recommendations** - Suggests layout improvements for specific goals
- **Accessibility checking** - Identifies and fixes accessibility issues

**AI Anti-Patterns to Avoid:**
- Generic "AI magic wand" buttons with unclear outcomes
- Replacing user creativity rather than augmenting it
- Unpredictable changes that frustrate power users
- AI features that don't learn from user preferences

---

## 2. User Experience Strategy

### 2.1 Core UX Principles

**1. Clarity Over Cleverness**
Every interface element must have obvious purpose and clear labeling. No mystery meat navigation, no ambiguous icons without labels, no hidden features.

**2. Progressive Disclosure**
Basic tasks should be dead simple. Advanced features should be discoverable but not overwhelming. Use a clear visual hierarchy: primary controls prominent, secondary controls accessible but quieter, advanced controls tucked into expandable sections.

**3. Immediate Feedback**
Every action gets instant visual confirmation. Dragging shows exactly where the block will land. Changing a color updates the preview immediately. No waiting, no uncertainty.

**4. Undo Is Sacred**
Users must feel safe experimenting. Comprehensive undo/redo with version snapshots. Clear visual indication of unsaved changes. Auto-save drafts frequently.

**5. Mobile Preview Is Primary**
Since 70%+ of emails open on mobile, the mobile preview should be prominently displayed and easy to toggle. Desktop preview is secondary.

**6. Speed and Efficiency**
Common actions (add text block, upload image, change color) should take 1-2 clicks maximum. Keyboard shortcuts for power users. Smart defaults reduce decision fatigue.

**7. Trust Through Consistency**
Consistent interaction patterns throughout the app. Consistent visual design language. Predictable behavior builds confidence and speed.

### 2.2 User Mental Model

**What Users Expect:**
- "This is like Canva, but for emails" - familiar drag-and-drop paradigm
- "What I see is what recipients get" - WYSIWYG accuracy is critical
- "The app handles email compatibility" - users shouldn't think about Outlook quirks
- "I can start from templates or blank canvas" - flexibility without forced choices

**Key Jobs to Be Done:**
1. Create a professional-looking email quickly (primary use case)
2. Customize templates to match brand identity
3. Ensure emails look good on mobile devices
4. Test how emails will actually look before sending
5. Save and reuse successful designs
6. Collaborate with team members (future consideration)

### 2.3 Information Hierarchy

**Primary Actions (Always Visible):**
- Add content blocks
- Edit selected block
- Preview (mobile/desktop)
- Save/Publish
- Undo/Redo

**Secondary Actions (Easily Discoverable):**
- Template library
- Settings/configurations
- Send test email
- Version history
- Export HTML

**Tertiary Actions (Contextual):**
- Advanced block settings
- Custom CSS (power users only)
- Accessibility checker
- AI assistance features

---

## 3. Information Architecture

### 3.1 Application Structure

```
Email Editor Application
├── Home/Dashboard
│   ├── Recent emails
│   ├── Templates
│   └── Create new (CTA)
│
├── Editor View (Primary Interface)
│   ├── Top Navigation Bar
│   │   ├── Email title (editable)
│   │   ├── Save status indicator
│   │   ├── Undo/Redo
│   │   ├── Preview toggle (mobile/desktop)
│   │   ├── Send test
│   │   └── Export/Publish
│   │
│   ├── Left Sidebar: Block Library
│   │   ├── Content Blocks
│   │   │   ├── Heading
│   │   │   ├── Text
│   │   │   ├── Image
│   │   │   ├── Image Gallery
│   │   │   ├── Button
│   │   │   └── Spacer/Divider
│   │   ├── Layout Blocks
│   │   │   ├── Single Column
│   │   │   ├── Two Columns
│   │   │   └── Three Columns
│   │   └── Template Blocks (saved patterns)
│   │
│   ├── Center Canvas: Email Preview
│   │   ├── Mobile/Desktop viewport toggle
│   │   ├── Draggable blocks
│   │   ├── Drop zones (visible on hover/drag)
│   │   ├── Inline editing (click to edit text)
│   │   └── Block controls (hover toolbar)
│   │
│   └── Right Sidebar: Design Controls
│       ├── Block-specific settings (contextual)
│       ├── Typography controls
│       ├── Color controls
│       ├── Spacing controls (padding/margin)
│       ├── Alignment options
│       ├── Background settings
│       └── Advanced settings (collapsible)
│
├── Template Library
│   ├── Categories (Newsletter, Promo, Welcome, etc.)
│   ├── Preview cards
│   └── Use template (opens in editor)
│
├── Settings
│   ├── Brand colors/fonts
│   ├── Default styles
│   ├── Email signature
│   ├── Cloudinary configuration
│   └── Resend API configuration
│
└── Version History
    ├── Timeline of saves
    ├── Preview snapshots
    └── Restore capability
```

### 3.2 Navigation Philosophy

**Single-Page App with Context Switching:**
- Editor is the primary context - users spend 90% of time here
- Other views (templates, settings, history) are overlays or slide-in panels
- Minimal navigation chrome - maximize canvas space
- Breadcrumbs only where necessary (you're always in "the editor")

**No Destructive Modals:**
- Confirmation dialogs only for truly destructive actions (delete email entirely)
- Auto-save prevents "are you sure?" on navigation
- Inline validation instead of blocking modals

---

## 4. Interface Design Specifications

### 4.1 Editor Layout (Primary Interface)

**Overall Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo] Email Title (editable)    [Save indicator] [↶↷] [👁 Preview]    │
│                                                [Test] [Export] [Publish] │
├─────────┬───────────────────────────────────────────────────┬───────────┤
│         │                                                   │           │
│ BLOCKS  │              CANVAS                              │  DESIGN   │
│ LIBRARY │          (Email Preview)                          │ CONTROLS  │
│         │                                                   │           │
│ Content │  ┌──────────────────────────────────────────┐   │ [Selected │
│ ├ Head  │  │ ┌──────────────────────────────────────┐ │   │  Block]   │
│ ├ Text  │  │ │  Header Block                        │ │   │           │
│ ├ Image │  │ └──────────────────────────────────────┘ │   │ Typography│
│ ├ Gal.  │  │                                          │   │ ├ Font    │
│ ├ Btn   │  │ ┌──────────────────────────────────────┐ │   │ ├ Size    │
│ └ Div.  │  │ │  Text Block                          │ │   │ └ Color   │
│         │  │ │  Lorem ipsum dolor sit amet...       │ │   │           │
│ Layout  │  │ └──────────────────────────────────────┘ │   │ Spacing   │
│ ├ 1 Col │  │                                          │   │ ├ Padding │
│ ├ 2 Col │  │ [+ Add Block] (drop zone)                │   │ └ Margin  │
│ └ 3 Col │  │                                          │   │           │
│         │  └──────────────────────────────────────────┘   │ Background│
│ Saved   │      640px width (desktop view shown)       │ └ Color   │
│ ├ Ptrn  │      (375px in mobile preview mode)            │           │
│         │                                                  │ [Advanced]│
└─────────┴──────────────────────────────────────────────────┴───────────┘
```

**Dimensions & Spacing:**
- Left Sidebar: 240px fixed width
- Right Sidebar: 300px fixed width
- Center Canvas: Fluid, centered, max-width based on preview mode
- Top Nav: 60px height
- Block Library: Compact icons + labels, 8px padding between items
- Canvas padding: 40px all sides (generous breathing room)

### 4.2 Block Library (Left Sidebar)

**Visual Design:**
- Section headers: 12px uppercase, medium weight, subtle color
- Block items:
  - Icon (24px) + Label (14px)
  - Hover state: subtle background fill, slight elevation
  - Drag state: follows cursor with shadow
  - Disabled state: reduced opacity when not applicable

**Categories:**
1. **Content Blocks** (always available)
   - Heading (H1, H2, H3 variants as sub-menu on click)
   - Text (paragraph)
   - Image (single image with optional link)
   - Image Gallery (2, 3, or 4 images)
   - Button (CTA)
   - Spacer/Divider (adds vertical space or horizontal rule)

2. **Layout Blocks** (containers)
   - Single Column (default, 100% width)
   - Two Columns (50/50 split)
   - Three Columns (33/33/33 split)
   - *Note: These add structure blocks can contain content blocks*

3. **Saved Patterns** (reusable combinations)
   - Template Patterns (saved block combinations)
   - *Note: Future AI-powered suggestions will integrate here*

**Interaction:**
- Click to add at bottom of canvas
- Drag to place precisely in drop zones
- Tooltip on hover explains block purpose
- Recently used blocks float to top (after 3+ uses)

### 4.3 Canvas Area (Center)

**Viewport Controls:**
```
┌─────────────────────────────────────────────┐
│ [📱 Mobile] [💻 Desktop]    [Zoom: 100% ▼] │
└─────────────────────────────────────────────┘
```

**Mobile View (Default):**
- 375px width (iPhone standard)
- Single column, vertical scroll
- This is the PRIMARY view users should design in

**Desktop View:**
- 640px width (optimal email width)
- Shows two-column layouts if used
- Helpful for checking desktop rendering

**Canvas Visual Design:**
- White background (email background)
- Subtle gray outer area (clearly "not the email")
- Dropped shadow around canvas edge (defines boundaries)
- Ruler/grid: Optional, toggled via keyboard shortcut (Cmd+R)

**Block Interaction States:**

1. **Default State:**
   - Clean, no visible controls
   - Subtle outline on hover (1px, #E5E5E5)

2. **Hover State:**
   - Toolbar appears above block:
     ```
     [↕ Drag] [✏️ Edit] [⎘ Copy] [🗑 Delete]
     ```
   - Outline becomes more visible (#999)

3. **Selected State:**
   - Blue outline (2px, primary brand color)
   - Toolbar remains visible
   - Design controls populate right sidebar
   - Click outside to deselect

4. **Dragging State:**
   - Original block becomes semi-transparent placeholder
   - Dragged copy follows cursor with shadow
   - Drop zones light up with animated dashed border
   - Snap-to-grid feel with subtle magnetic pull

**Drop Zones:**
- Appear between blocks when dragging
- Expand on hover (16px height minimum)
- Blue dashed border with subtle pulse animation
- Show preview of where block will land
- Label: "Drop here" on first use, hidden after

**Inline Editing:**
- Double-click text to enter edit mode
- Text becomes editable field with cursor
- Format toolbar appears inline (bold, italic, link)
- Click outside or press Escape to exit
- Undo works within text editing and at block level

### 4.4 Design Controls (Right Sidebar)

**Contextual Panel:**
- Header shows selected block type icon + name
- "No block selected" state: Shows email-level settings
- Controls are grouped in collapsible sections (all expanded by default)

**Typography Section** (for text/heading blocks):
```
Typography
├ Font Family: [Dropdown: Arial, Georgia, Verdana...]
├ Font Size: [Slider: 14px - 48px] [Input: 24px]
├ Font Weight: [Normal] [Medium] [Bold]
├ Text Color: [Color picker] #333333
├ Line Height: [Slider: 1.0 - 2.0] [Input: 1.5]
└ Text Align: [Left] [Center] [Right] [Justify]
```

**Color Controls:**
- Large color swatch (current color)
- Click opens color picker popover:
  - Brand colors (top row, 6 saved colors)
  - Recent colors (second row)
  - Custom color picker (hue/saturation grid)
  - Hex input field
  - Opacity slider (only for backgrounds)

**Spacing Section:**
```
Spacing
├ Padding Top:    [Input: 20px] [↕ Link all]
├ Padding Right:  [Input: 20px]
├ Padding Bottom: [Input: 20px]
├ Padding Left:   [Input: 20px]
├─────────────────
├ Margin Top:     [Input: 0px]
└ Margin Bottom:  [Input: 0px]
```
*Link all toggle: When active, one input controls all four padding values*

**Image Section** (for image blocks):
```
Image
├ Source: [Upload] [Cloudinary] [URL]
│   └ [Thumbnail preview]
├ Alt Text: [Input: "Description for accessibility"]
├ Link URL: [Input: "https://..."] (optional)
├ Alignment: [Left] [Center] [Right]
├ Width: [Auto] [Custom: 300px]
└ Corner Radius: [Slider: 0px - 20px]
```

**Button Section** (for button blocks):
```
Button
├ Button Text: [Input: "Click Here"]
├ Link URL: [Input: "https://..."]
├ Background Color: [Color picker]
├ Text Color: [Color picker]
├ Border Radius: [Slider: 0px - 25px]
├ Padding: [Input: 12px 24px]
└ Alignment: [Left] [Center] [Right]
```

**Background Section** (email or layout blocks):
```
Background
├ Color: [Color picker] (transparent default)
└ Image: [Upload] [Cloudinary] [URL]
    ├ [Thumbnail preview]
    ├ Position: [Top] [Center] [Bottom]
    └ Fallback Color: [Color picker] (for Outlook)
```

**Advanced Section** (collapsed by default):
```
Advanced ⌄
├ Block ID: [Input: custom-id] (for tracking)
├ CSS Class: [Input: custom-class]
├ Conditional Display: [Toggle]
│   └ Show if: [Condition builder]
└ Custom HTML: [Toggle dangerous mode]
```

**Visual Design Notes:**
- Generous whitespace between sections (24px)
- Section headers: 14px medium weight
- Input fields: Clear focus states, 40px height (easy to tap)
- Sliders: Show value label above thumb while dragging
- Dropdowns: Large, searchable for font selection
- Color pickers: Large touch targets, accessible keyboard controls

### 4.5 Top Navigation Bar

**Left Side:**
```
[Logo Icon] "Untitled Email" [✏️ Edit name]
```
- Click email name to rename inline
- Auto-save indicator:
  - "Saving..." (spinning icon)
  - "Saved" (checkmark, fades after 2s)
  - "Error saving" (red, persistent, click for details)

**Center:**
```
[↶ Undo] [↷ Redo]
```
- Disabled state when no actions to undo/redo
- Tooltip shows action name: "Undo: Add text block"
- Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z

**Right Side:**
```
[👁 Preview] [📧 Send Test] [💾 Export HTML] [🚀 Publish]
```

**Preview Button:**
- Toggles full-screen preview overlay
- Shows mobile and desktop side-by-side
- Dark mode toggle in preview
- "Send test email" action available in preview
- Close with X or Escape key

**Send Test Button:**
- Opens modal:
  ```
  Send Test Email
  ├ To: [Input: email@example.com]
  ├ From: [Dropdown: verified sender addresses]
  ├ Subject: [Input: "Test: {email name}"]
  └ [Cancel] [Send Test]
  ```
- Success: Green toast notification "Test sent to email@example.com"
- Error: Red toast with error message and retry option

**Export HTML Button:**
- Downloads .html file immediately
- Filename: email-title-2025-12-05.html
- Option in dropdown: "Copy HTML to clipboard"

**Publish Button:**
- Primary action, prominent styling (filled button, brand color)
- Opens publish modal with final checks:
  ```
  Ready to Publish?
  ├ ✓ Mobile preview looks good
  ├ ✓ All images have alt text
  ├ ✓ All links are valid
  ├ ⚠ Subject line not set (optional)
  └ [Cancel] [Publish Email]
  ```
- After publish: Copy HTML or integrate with email platform

---

## 5. AI Integration Strategy

### 5.1 High-Value AI Features (Prioritized)

**Tier 1: MVP Must-Haves**

1. **AI Subject Line Generator**
   - **Why:** 30-45% higher open rates proven in research
   - **Where:** Available in top nav and publish modal
   - **How:**
     - User inputs: email purpose, tone, key benefit
     - AI generates 5-7 subject line variations
     - Shows predicted open rate score (based on best practices)
     - A/B test suggestion: "Try these two in a split test"
   - **UI:**
     ```
     Generate Subject Lines (AI)
     ├ Email purpose: [Dropdown: Newsletter, Promotion, Welcome, etc.]
     ├ Tone: [Casual] [Professional] [Urgent] [Friendly]
     ├ Key benefit: [Input: "50% off sale"]
     └ [Generate 5 Options]

     Results:
     ├ "Don't miss out: 50% off everything" (⭐ 8.2/10)
     ├ "Your exclusive 50% discount ends tonight" (⭐ 8.7/10)
     ├ "Flash sale: Half off sitewide" (⭐ 7.9/10)
     └ ... [Use this] buttons
     ```

2. **AI Content Drafter**
   - **Why:** Overcomes blank-page paralysis, accelerates workflow
   - **Where:** Right sidebar, "Smart Blocks" section
   - **How:**
     - User describes email goal in plain language
     - AI generates complete email structure with blocks
     - User can accept all, accept individual blocks, or reject
   - **UI:**
     ```
     AI Content Assistant
     ├ Describe your email:
     │  [Text area: "Monthly newsletter highlighting new
     │   features and customer success story"]
     ├ Brand voice: [Dropdown: Friendly, Professional, etc.]
     └ [Generate Draft]

     Preview:
     ├ Header: "What's New This Month"
     ├ Text: "We're excited to share..."
     ├ Image: [Placeholder for feature screenshot]
     ├ Button: "Learn More"
     └ [Add All Blocks] [Review Individually]
     ```

3. **Smart Image Alt Text Generator**
   - **Why:** Accessibility is critical, often neglected
   - **Where:** Automatic when image uploaded, editable in sidebar
   - **How:**
     - Image uploaded → AI analyzes → generates descriptive alt text
     - User can edit or approve
     - Warning if alt text missing on publish
   - **UI:**
     ```
     Image Settings
     ├ [Image preview]
     ├ Alt Text: [Generated by AI ✨]
     │  "Woman using laptop in modern office workspace"
     │  [✓ Use this] [✏️ Edit]
     └ ...
     ```

**Tier 2: High-Value Enhancements**

4. **AI Copy Optimizer**
   - **Why:** Improves clarity, engagement, conversion
   - **Where:** Right-click text block → "Optimize with AI"
   - **How:**
     - AI analyzes current text
     - Suggests improvements: shorter, clearer, more persuasive
     - Shows before/after comparison
     - Explains changes
   - **UI:**
     ```
     AI Copy Suggestions

     Original:
     "We have a lot of new features that we think you'll
      really like and want you to check them out."

     Improved: ✨
     "Discover three new features built for you."

     Changes:
     ├ ✓ Reduced word count by 60%
     ├ ✓ Made call-to-action clearer
     └ ✓ More engaging tone

     [Use Suggestion] [Keep Original]
     ```

5. **AI Layout Recommendations**
   - **Why:** Guides non-designers to better structure
   - **Where:** Canvas toolbar, "Get AI suggestions" button
   - **How:**
     - AI analyzes current layout
     - Identifies issues: too dense, poor hierarchy, CTA buried
     - Suggests specific improvements
     - Can auto-apply or show preview
   - **UI:**
     ```
     AI Layout Analysis

     ⚠ Issues found:
     ├ Your main CTA button is below the fold on mobile
     ├ Too many images may slow load time
     └ Text blocks lack visual hierarchy

     Suggestions:
     ├ 1. Move "Shop Now" button higher (after 1st paragraph)
     ├ 2. Reduce image gallery from 6 to 4 images
     └ 3. Make first sentence larger and bold

     [Apply All] [Review One-by-One] [Dismiss]
     ```

6. **AI Personalization Token Suggester**
   - **Why:** Personalization increases engagement
   - **Where:** Text editing, suggests when appropriate
   - **How:**
     - User types "Hello" in text block
     - AI suggests: "Add {firstName} for personalization?"
     - Inserts merge tag that email platform will populate
   - **UI:**
     ```
     💡 Personalization Suggestion
     "Hello {firstName}" increases open rates by 26%
     [Add {firstName}] [No thanks]
     ```

**Tier 3: Future Considerations**

7. **AI Accessibility Checker**
   - Scans entire email for accessibility issues
   - Checks: alt text, color contrast, link text clarity, heading structure
   - Provides actionable fixes

8. **AI A/B Test Generator**
   - Creates variations automatically for testing
   - Suggests what to test: subject line, CTA text, image vs no image
   - Tracks performance and learns

9. **AI Send Time Optimizer**
   - Integration with email platform
   - Analyzes recipient engagement patterns
   - Recommends best send time per segment

### 5.2 AI UX Principles

**Transparency:**
- Always label AI-generated content with ✨ or "AI" badge
- Never silently change user content
- Explain AI suggestions with brief rationale

**User Control:**
- AI suggests, user decides
- Every AI action can be undone
- Option to disable AI features entirely in settings

**Progressive Disclosure:**
- Basic AI (subject lines, alt text) is prominent
- Advanced AI (layout optimization) is discoverable but not pushy
- Power users can access via keyboard shortcuts

**Learning from User Behavior:**
- If user rejects AI suggestions repeatedly, show less often
- If user always accepts subject line #2, prioritize similar styles
- Store preferences: preferred tone, style, complexity

**No "Magic" Without Context:**
- Avoid generic "Make this better" buttons
- Specific AI features with clear outcomes
- Preview before apply

### 5.3 AI Technical Implementation Notes

**Anthropic Claude API Integration:**

**Model Selection Strategy:**
- **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) - **PRIMARY MODEL**
  - Use for: Content generation, copy optimization, layout recommendations, personalization suggestions
  - Why: Best balance of speed, cost, and quality for interactive features
  - Response time: Fast enough for real-time suggestions
  - Cost: Moderate, suitable for high-volume usage

- **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) - **QUICK TASKS**
  - Use for: Alt text generation, simple text improvements, quick validations
  - Why: Extremely fast and cost-effective for simple tasks
  - Response time: Near-instant
  - Cost: Low, ideal for automatic features (like alt text on every image upload)

- **Claude Opus 4.1** (`claude-opus-4-20250514`) - **HIGH-VALUE FEATURES**
  - Use for: Complex email drafting, sophisticated A/B test variations, advanced copy optimization
  - Why: Highest quality output when user explicitly requests premium AI assistance
  - Response time: Slower, but acceptable for deliberate actions
  - Cost: Higher, reserve for user-initiated, high-value features
  - Example: When user clicks "Generate Complete Email Draft" (not for quick suggestions)

- **Claude Opus 4** (`claude-opus-4-20250213`) - **FALLBACK/SPECIAL CASES**
  - Use for: Compatibility or specific use cases where needed
  - Why: Available as alternative if newer models encounter issues

**Implementation Guidelines:**
- Implement streaming responses for long-form content (drafts, multi-paragraph optimizations)
- Cache system prompts to reduce API costs and improve response times
- Provide rich context: brand voice, previous emails, user preferences, email purpose
- Use Sonnet 4.5 by default unless task specifically benefits from Haiku's speed or Opus's quality
- Allow power users to choose model preference in settings (default to recommended)

**Model Usage by Feature:**
```typescript
const AI_FEATURES_MODEL_MAP = {
  // Haiku 4.5 - Fast, automatic, high-frequency tasks
  'altTextGeneration': 'claude-haiku-4-5-20251001',
  'quickTextSuggestions': 'claude-haiku-4-5-20251001',
  'accessibilityCheck': 'claude-haiku-4-5-20251001',

  // Sonnet 4.5 - Primary workhorse for most features
  'subjectLineGeneration': 'claude-sonnet-4-5-20250929',
  'copyOptimization': 'claude-sonnet-4-5-20250929',
  'layoutRecommendations': 'claude-sonnet-4-5-20250929',
  'personalizationSuggestions': 'claude-sonnet-4-5-20250929',
  'contentEditing': 'claude-sonnet-4-5-20250929',

  // Opus 4.1 - Premium, user-initiated, high-value tasks
  'fullEmailDraft': 'claude-opus-4-20250514',
  'advancedCopywriting': 'claude-opus-4-20250514',
  'complexABTestGeneration': 'claude-opus-4-20250514',
  'brandVoiceAnalysis': 'claude-opus-4-20250514',
};
```

**Prompt Engineering Strategy:**
- System prompts define constraints: email-safe HTML, accessibility focus, client compatibility
- Include examples of good email copy in prompts (few-shot learning)
- Specify output format: JSON for structured data, plain text for prose, HTML for content blocks
- User brand voice profile stored and injected into all prompts for consistency
- Include email type context (newsletter vs promo vs transactional) in prompts

**Error Handling:**
- AI failure doesn't break core editor functionality
- Graceful degradation: "AI assistant temporarily unavailable"
- Retry mechanism with exponential backoff (3 attempts max)
- Fallback chain: Opus → Sonnet → Haiku → disable feature gracefully
- Clear user communication when AI is unavailable
- Fallback to non-AI defaults (empty alt text with reminder, manual copywriting)

---

## 6. Email HTML Technical Strategy

### 6.1 HTML Generation Approach

**Hybrid Coding Technique:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Title</title>
  <style type="text/css">
    /* Media queries for responsive design (ignored by Outlook/desktop Gmail) */
    @media only screen and (max-width: 600px) {
      .mobile-full-width { width: 100% !important; }
      .mobile-hide { display: none !important; }
      .mobile-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <!-- Outlook ghost table using conditional comments -->
  <!--[if mso]>
  <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td>
  <![endif]-->

  <!-- Modern div-based container -->
  <div style="max-width: 640px; margin: 0 auto;">
    <!-- Content blocks here -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333333;">
          Hello World!
        </td>
      </tr>
    </table>
  </div>

  <!--[if mso]>
      </td>
    </tr>
  </table>
  <![endif]-->
</body>
</html>
```

**Block Component HTML Templates:**

1. **Heading Block:**
```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding: 20px; font-family: Georgia, serif; font-size: 32px; font-weight: bold; color: #000000; text-align: center;">
      {{headingText}}
    </td>
  </tr>
</table>
```

2. **Text Block:**
```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333333;">
      {{textContent}}
    </td>
  </tr>
</table>
```

3. **Image Block:**
```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding: 20px;">
      <a href="{{linkUrl}}" target="_blank">
        <img src="{{imageUrl}}" alt="{{altText}}" width="{{width}}" style="display: block; max-width: 100%; height: auto; border: 0;" />
      </a>
    </td>
  </tr>
</table>
```

4. **Button Block:**
```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding: 20px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                   xmlns:w="urn:schemas-microsoft-com:office:word"
                   href="{{linkUrl}}"
                   style="height:44px;v-text-anchor:middle;width:200px;"
                   arcsize="{{borderRadiusPercent}}%"
                   strokecolor="{{backgroundColor}}"
                   fillcolor="{{backgroundColor}}">
        <w:anchorlock/>
        <center style="color:{{textColor}};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">{{buttonText}}</center>
      </v:roundrect>
      <![endif]-->
      <a href="{{linkUrl}}" target="_blank" style="background-color: {{backgroundColor}}; border: 2px solid {{backgroundColor}}; border-radius: {{borderRadius}}px; color: {{textColor}}; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 44px; text-align: center; text-decoration: none; width: 200px; -webkit-text-size-adjust: none; mso-hide: all;">{{buttonText}}</a>
    </td>
  </tr>
</table>
```

5. **Two-Column Layout Block:**
```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding: 20px;">
      <!--[if mso]>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="50%" valign="top">
      <![endif]-->
      <div style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
        {{leftColumnContent}}
      </div>
      <!--[if mso]>
          </td>
          <td width="50%" valign="top">
      <![endif]-->
      <div style="display: inline-block; width: 100%; max-width: 280px; vertical-align: top;">
        {{rightColumnContent}}
      </div>
      <!--[if mso]>
          </td>
        </tr>
      </table>
      <![endif]-->
    </td>
  </tr>
</table>
```

### 6.2 CSS Inlining Strategy

**Build Process:**
1. Editor stores styles as JSON:
   ```json
   {
     "blockType": "text",
     "styles": {
       "padding": "20px",
       "fontFamily": "Arial, sans-serif",
       "fontSize": "16px",
       "lineHeight": "1.5",
       "color": "#333333"
     }
   }
   ```

2. Template engine inserts styles inline:
   - Convert JSON to CSS string
   - Apply to `style` attribute
   - No external stylesheets, no class names (except for media query targets)

3. Media query classes added for responsive behavior:
   - Generated in `<style>` tag in `<head>`
   - Only for mobile-specific overrides
   - Desktop styles are inline (default)

**Inliner Library:**
- Use Juice or similar to inline remaining styles
- Preserve media queries in `<style>` block
- Remove unused CSS
- Validate against email client quirks

### 6.3 Image Handling

**Cloudinary Integration:**
- Upload images to Cloudinary via editor
- Automatic optimization: format, compression, responsive sizing
- Generate transformations:
  - Desktop size: max 600px width
  - Mobile size: max 375px width (served via media query if supported)
  - Retina: 2x resolution for crisp display
- Store Cloudinary URL in block data
- Alt text stored separately (required field)

**Image Loading Best Practices:**
- Always specify width/height attributes (prevents layout shift)
- Use `display: block;` to prevent spacing issues
- Fallback alt text styling:
  ```css
  style="display: block; max-width: 100%; height: auto;
         border: 0; font-family: Arial, sans-serif;
         font-size: 14px; color: #666666;"
  ```
- Background images: require VML fallback for Outlook

**Image Gallery Block:**
- 2 images: 50/50 split
- 3 images: 33/33/33 split
- 4 images: 2x2 grid
- Mobile: stack vertically
- Use nested tables, not CSS grid/flexbox

### 6.4 Responsive Design Implementation

**Mobile-First Approach:**
```css
/* Inline styles = mobile defaults */
<td style="padding: 20px; font-size: 16px;">

/* Media query = desktop enhancements (if needed) */
<style>
  @media only screen and (min-width: 600px) {
    .desktop-large-text { font-size: 18px !important; }
  }
</style>
```

**Common Responsive Patterns:**
- Font size bumps on desktop
- Hide/show content based on device
- Column stacking on mobile
- Padding adjustments (more generous on desktop)

**Testing:**
- Litmus or Email on Acid for comprehensive client testing
- Manual tests in Gmail (mobile app, desktop web), Outlook (Windows, Mac), Apple Mail (iOS, macOS)
- Dark mode testing in all clients

### 6.5 HTML Export Features

**Export Options:**
1. **Download HTML file:**
   - Fully inlined, production-ready
   - Includes all images via absolute URLs (Cloudinary)
   - Commented sections for easy editing

2. **Copy to clipboard:**
   - Same as download, but copies to clipboard
   - One-click paste into email platform

3. **Export for platform:**
   - Mailchimp: Add merge tags ({{firstName}})
   - Constant Contact: Add tokens (*|FNAME|*)
   - Resend: API-ready JSON format
   - Generic: Standard merge tags

4. **Version history export:**
   - Export any previous version
   - Side-by-side comparison view

---

## 7. Component Architecture & Design System

### 7.1 Frontend Technology Recommendations

**Framework:** React with TypeScript
- Component-based architecture matches block paradigm
- Strong typing reduces bugs in complex editor
- Rich ecosystem for drag-and-drop (react-dnd, dnd-kit)
- Server-side rendering for fast initial load

**State Management:** Zustand or Jotai
- Simpler than Redux for this use case
- Local state for UI, global state for email data
- Easy undo/redo implementation with immer

**Drag-and-Drop:** dnd-kit
- Modern, accessible, touch-friendly
- Built-in keyboard support
- Performant for complex layouts
- Works with virtual scrolling if needed

**Styling:** Tailwind CSS + CSS Modules
- Tailwind for rapid UI development
- CSS Modules for component isolation
- Design tokens for consistency

**Editor:** Custom canvas (not contenteditable)
- Render email as React components
- Inline editing uses controlled inputs
- Full control over HTML output

### 7.2 Component Hierarchy

```
App
├── AppShell
│   ├── TopNav
│   │   ├── Logo
│   │   ├── EmailTitleEditor
│   │   ├── SaveStatus
│   │   ├── UndoRedoControls
│   │   ├── PreviewToggle
│   │   └── ActionButtons (Test, Export, Publish)
│   │
│   ├── EditorLayout
│   │   ├── BlockLibrary (Left Sidebar)
│   │   │   ├── BlockCategory
│   │   │   └── DraggableBlockItem
│   │   │
│   │   ├── Canvas (Center)
│   │   │   ├── ViewportControls
│   │   │   ├── EmailCanvas
│   │   │   │   ├── DropZone
│   │   │   │   ├── EmailBlock (recursive)
│   │   │   │   │   ├── BlockToolbar
│   │   │   │   │   ├── HeadingBlock
│   │   │   │   │   ├── TextBlock
│   │   │   │   │   ├── ImageBlock
│   │   │   │   │   ├── ImageGalleryBlock
│   │   │   │   │   ├── ButtonBlock
│   │   │   │   │   ├── SpacerBlock
│   │   │   │   │   └── LayoutBlock (container)
│   │   │   │   └── DropZone
│   │   │   └── EmptyState
│   │   │
│   │   └── DesignControls (Right Sidebar)
│   │       ├── BlockHeader
│   │       ├── TypographyControls
│   │       ├── ColorControls
│   │       ├── SpacingControls
│   │       ├── ImageControls
│   │       ├── ButtonControls
│   │       ├── BackgroundControls
│   │       └── AdvancedControls
│   │
│   └── Modals/Overlays
│       ├── PreviewModal
│       ├── SendTestModal
│       ├── PublishModal
│       ├── TemplateLibrary
│       ├── VersionHistory
│       ├── Settings
│       └── AIAssistant
│
└── Providers
    ├── EmailDataProvider (global email state)
    ├── HistoryProvider (undo/redo)
    ├── ThemeProvider
    └── AuthProvider
```

### 7.3 Design System Tokens

**Colors:**
```javascript
const colors = {
  // Brand
  primary: '#2563EB',      // Blue - primary actions
  primaryHover: '#1D4ED8',
  primaryLight: '#DBEAFE',

  // Neutrals
  gray50: '#F9FAFB',       // Backgrounds
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',      // Borders
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',      // Disabled text
  gray500: '#6B7280',      // Secondary text
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',      // Primary text
  gray900: '#111827',      // Headings

  // Feedback
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Email-safe defaults (for email content)
  emailBlack: '#000000',
  emailDarkGray: '#333333',
  emailGray: '#666666',
  emailLightGray: '#999999',
  emailWhite: '#FFFFFF',
  emailBlue: '#0066CC',
};
```

**Typography:**
```javascript
const typography = {
  // UI (app interface)
  fontFamily: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Monaco, "Courier New", monospace',
  },

  // Email-safe fonts (for email content)
  emailFonts: {
    arial: 'Arial, Helvetica, sans-serif',
    georgia: 'Georgia, Times, serif',
    verdana: 'Verdana, Geneva, sans-serif',
    times: '"Times New Roman", Times, serif',
    courier: '"Courier New", Courier, monospace',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

**Spacing:**
```javascript
const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
};
```

**Shadows:**
```javascript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};
```

**Border Radius:**
```javascript
const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};
```

### 7.4 Data Model

**Email Document Structure:**
```typescript
interface EmailDocument {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;

  metadata: {
    subject?: string;
    preheader?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
  };

  settings: {
    backgroundColor: string;
    contentWidth: number;  // 640px default
    fontFamily: string;
    textColor: string;
  };

  blocks: EmailBlock[];

  history: EmailVersion[];
}

interface EmailBlock {
  id: string;  // unique ID for this block instance
  type: 'heading' | 'text' | 'image' | 'imageGallery' | 'button' | 'spacer' | 'divider' | 'layout';
  order: number;  // position in email
  parentId?: string;  // for nested blocks (inside layout blocks)

  // Block-specific data (discriminated union)
  data: HeadingBlockData | TextBlockData | ImageBlockData | etc.

  // Common styles
  styles: {
    padding?: SpacingValue;
    margin?: SpacingValue;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

interface HeadingBlockData {
  level: 1 | 2 | 3;
  text: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  color: string;
  lineHeight: number;
}

interface TextBlockData {
  content: string;  // HTML string (bold, italic, links allowed)
  fontFamily: string;
  fontSize: string;
  color: string;
  lineHeight: number;
}

interface ImageBlockData {
  src: string;  // Cloudinary URL
  alt: string;
  width?: number;
  linkUrl?: string;
  alignment: 'left' | 'center' | 'right';
  borderRadius?: number;
}

interface ImageGalleryBlockData {
  layout: '2-col' | '3-col' | '4-col';
  images: Array<{
    src: string;
    alt: string;
    linkUrl?: string;
  }>;
  gap: number;  // spacing between images
}

interface ButtonBlockData {
  text: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  padding: SpacingValue;
  alignment: 'left' | 'center' | 'right';
  width?: number;
}

interface LayoutBlockData {
  columns: number;  // 1, 2, or 3
  children: EmailBlock[];  // nested blocks
  gap: number;
}

interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface EmailVersion {
  id: string;
  timestamp: Date;
  blocks: EmailBlock[];
  message?: string;  // optional save message
}
```

### 7.5 Accessibility Requirements

**Keyboard Navigation:**
- Tab through all interactive elements in logical order
- Arrow keys to navigate between blocks in canvas
- Enter to select block
- Spacebar to drag, arrows to move, space to drop
- Escape to cancel actions, close modals, deselect
- Cmd+Z / Cmd+Shift+Z for undo/redo
- Cmd+S to save
- Cmd+Shift+P to preview

**Screen Reader Support:**
- All controls labeled with aria-label or aria-labelledby
- Live regions announce save status, errors, AI suggestions
- Block type announced when selected: "Text block, 3 of 8"
- Drag operations announced: "Moved text block to position 5"

**Focus Management:**
- Visible focus indicators (2px outline, brand color)
- Focus trap in modals
- Return focus to trigger element when modal closes
- Skip to canvas link for keyboard users

**Color Contrast:**
- All text meets WCAG AA: 4.5:1 for normal text, 3:1 for large text
- Interactive elements distinguishable without color alone
- Error messages include icons, not just red color

**Email Content Accessibility:**
- Alt text required for all images (enforced on publish)
- Heading hierarchy checked (no skipped levels)
- Link text descriptive (warn against "click here")
- Color contrast checker for email content
- Semantic HTML in output (headings use h1/h2/h3 tags in fallback)

---

## 8. User Flows

### 8.1 Flow: Create Email from Blank Canvas

1. **Entry:** User clicks "Create New Email" from dashboard
2. **Landing:** Editor loads with:
   - Blank canvas (empty state message: "Start by dragging a block")
   - Block library visible on left
   - Design controls show email-level settings
3. **Add First Block:**
   - User drags "Heading" block to canvas
   - Drop zone appears, user drops
   - Block appears with default text: "Your heading here"
   - Block is auto-selected
   - Design controls update to show heading options
4. **Edit Content:**
   - User double-clicks heading text
   - Text becomes editable
   - User types new heading
   - Click outside to finish editing
5. **Customize Design:**
   - User adjusts font size slider in right sidebar
   - Preview updates immediately
   - User changes color, updates immediately
6. **Add More Blocks:**
   - User clicks "Image" block in library (not drag)
   - Block appears at bottom of email
   - Image upload dialog appears automatically
   - User uploads image from computer
   - Image uploads to Cloudinary (progress indicator)
   - AI generates alt text
   - User approves or edits alt text
7. **Add Button:**
   - User drags Button block below image
   - User edits button text inline: "Shop Now"
   - User pastes link URL in right sidebar
   - User changes button color to brand color
8. **Preview:**
   - User clicks "Preview" in top nav
   - Full-screen modal shows mobile and desktop previews side-by-side
   - User toggles dark mode to check rendering
   - User clicks close
9. **Save:**
   - Auto-save has been running throughout (indicator shows "Saved")
   - User manually saves with Cmd+S (creates version snapshot)
10. **Send Test:**
    - User clicks "Send Test"
    - Modal appears with test email form
    - User enters their email
    - Clicks "Send Test"
    - Success toast appears
    - User checks their inbox
11. **Publish:**
    - User clicks "Publish"
    - Publish checklist modal appears
    - All checks pass (mobile preview ✓, alt text ✓, links ✓)
    - User clicks "Publish Email"
    - Success screen with options: Copy HTML, Download, Export to platform

**Duration:** 5-8 minutes for simple email

### 8.2 Flow: Use Template

1. **Entry:** User clicks "Templates" from dashboard or editor
2. **Browse:** Template library modal opens
   - Categories across top: All, Newsletter, Promo, Welcome, Announcement
   - Template cards show thumbnail preview + title
   - Hover shows "Use template" button
3. **Preview:** User clicks template card
   - Larger preview appears
   - Mobile and desktop views
   - "Use This Template" button prominent
4. **Customize:** User clicks "Use This Template"
   - Template loads in editor with all blocks
   - User immediately starts editing:
     - Replace placeholder text
     - Upload new images
     - Change colors to match brand
     - Adjust spacing
5. **AI Assistance:** User selects all text blocks
   - Clicks "Optimize with AI" in context menu
   - AI rewrites copy in user's brand voice
   - User reviews and accepts suggestions
6. **Continue as normal:** Same as create-from-scratch flow (preview, test, publish)

**Duration:** 3-5 minutes for template customization

### 8.3 Flow: Generate Email with AI

1. **Entry:** User clicks "AI Assistant" in block library
2. **Describe:** AI panel expands:
   ```
   Describe your email:
   [Text area]

   Email type: [Newsletter ▼]
   Brand voice: [Professional ▼]
   ```
   User types: "Monthly update about new features, customer spotlight, and upcoming webinar"
3. **Generate:** User clicks "Generate Draft"
   - Loading state (AI working animation)
   - Preview of generated structure appears:
     ```
     Preview:
     ├ Heading: "What's New in December"
     ├ Text: "This month we shipped..."
     ├ Image: [Placeholder: Feature screenshot]
     ├ Heading: "Customer Spotlight"
     ├ Text: "Meet Sarah, who..."
     ├ Image: [Placeholder: Customer photo]
     ├ Button: "Register for Webinar"
     ```
4. **Review:** User can:
   - Accept all blocks (adds to canvas)
   - Edit individual blocks before adding
   - Reject and try again
5. **Customize:** User accepts all
   - Blocks appear in canvas
   - User uploads real images (replaces placeholders)
   - User edits AI-generated text to match reality
   - User adds webinar link to button
6. **AI Subject Line:** User clicks "Generate Subject Lines"
   - AI generates 5 options based on email content
   - User selects best one
7. **Continue:** Preview, test, publish

**Duration:** 2-4 minutes with AI assistance

### 8.4 Flow: Restore Previous Version

1. **Entry:** User clicks "Version History" in top nav
2. **Browse:** Version history panel slides in from right
   - Timeline of saves (auto-saves + manual snapshots)
   - Each version shows:
     - Timestamp: "Today at 2:34 PM"
     - Thumbnail preview
     - Change summary: "Added button, changed header"
3. **Preview:** User clicks version
   - Larger preview appears
   - Compare to current version (side-by-side)
4. **Restore:** User clicks "Restore This Version"
   - Confirmation: "Current version will be saved before restoring"
   - User confirms
   - Email reverts to selected version
   - Current version saved as new version (safety net)
5. **Continue editing:** User makes additional changes

**Duration:** 30 seconds to restore

### 8.5 Flow: Error Recovery

**Scenario:** User loses internet connection while editing

1. **Detection:** App detects offline state
   - Save status indicator shows "Offline - changes saved locally"
   - Yellow banner appears: "You're offline. Changes will sync when reconnected."
2. **Continue editing:** User keeps working
   - All changes saved to localStorage
   - No functionality lost (except AI features, preview, send test)
3. **Reconnection:** Internet restored
   - Banner changes: "Back online. Syncing changes..."
   - Auto-save uploads local changes
   - Success: "All changes synced ✓"
4. **Conflict resolution:** If someone else edited the same email:
   - Modal appears: "This email was changed by [User] while you were offline"
   - Options:
     - Keep your version (overwrites server)
     - Keep their version (discards local changes)
     - View both and merge manually

---

## 9. Implementation Roadmap

### Phase 1: MVP Foundation (Weeks 1-4)

**Goal:** Functional editor with core blocks and basic email generation

**Deliverables:**
- [ ] Project setup (React, TypeScript, Tailwind, Vite)
- [ ] Design system implementation (tokens, base components)
- [ ] App shell (top nav, layout, sidebars)
- [ ] Block library UI (left sidebar)
- [ ] Canvas area with drag-and-drop (dnd-kit integration)
- [ ] Core blocks (rendering only):
  - Heading block
  - Text block
  - Image block
  - Button block
  - Spacer block
- [ ] Design controls (right sidebar):
  - Typography controls
  - Color picker
  - Spacing controls
- [ ] Email data model and state management (Zustand)
- [ ] HTML generation engine (table-based templates)
- [ ] Export HTML functionality

**Success Criteria:**
- Can drag blocks onto canvas
- Can edit text inline
- Can upload images (local only, Cloudinary in Phase 2)
- Can adjust basic styles
- Can export valid HTML email
- HTML renders correctly in Gmail and Outlook (manual test)

### Phase 2: Essential Features (Weeks 5-7)

**Goal:** Production-ready editor with save, undo, and preview

**Deliverables:**
- [ ] Undo/redo system (immer + history state)
- [ ] Auto-save functionality
- [ ] Version history (save snapshots)
- [ ] Preview modal (mobile + desktop views)
- [ ] Cloudinary integration (image upload)
- [ ] Resend integration (send test emails)
- [ ] Additional blocks:
  - Image gallery
  - Layout blocks (2-col, 3-col)
- [ ] Responsive email generation (media queries)
- [ ] Dark mode preview
- [ ] Settings page (brand colors, default fonts)

**Success Criteria:**
- Changes auto-save reliably
- Undo/redo works for all actions
- Can send test emails that render correctly
- Images upload to Cloudinary
- Mobile preview accurately reflects email output
- Can save and restore versions

### Phase 3: Enhanced Editor Experience (Weeks 8-10)

**Goal:** Polish core editor and add power-user features

**Deliverables:**
- [ ] Template library (pre-built email templates)
- [ ] Keyboard shortcuts (comprehensive)
- [ ] Accessibility audit and fixes (WCAG AA compliance)
- [ ] Performance optimization (60fps interactions)
- [ ] Advanced block settings (conditional display)
- [ ] Email client testing suite integration (Litmus/Email on Acid)
- [ ] Comprehensive error handling and recovery
- [ ] User preferences and settings
- [ ] Analytics integration (usage tracking)

**Success Criteria:**
- Editor feels fast and responsive across all interactions
- Keyboard users can complete full workflow without mouse
- Templates cover 5+ common email use cases
- All accessibility requirements met
- Email client testing integrated into workflow
- Performance metrics: < 100ms interaction response time

### Phase 4: Production Readiness (Weeks 11-13)

**Goal:** Production-ready, battle-tested application

**Deliverables:**
- [ ] Comprehensive testing (unit, integration, E2E with Playwright)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Email client rendering tests (Gmail, Outlook, Apple Mail, Yahoo)
- [ ] Performance testing and optimization
- [ ] Security audit (XSS, CSRF, API key management, input validation)
- [ ] Error monitoring setup (Sentry or similar)
- [ ] Onboarding flow (first-time user tutorial)
- [ ] Documentation and help resources
- [ ] Bug fixes and refinements from testing
- [ ] Beta user testing program

**Success Criteria:**
- All critical bugs resolved
- < 2s initial load time
- 99.9% HTML email compatibility across major clients
- No security vulnerabilities
- Beta users successfully create and send emails
- New users can create first email in < 10 minutes
- Clear documentation and contextual help

### Phase 5: Launch (Weeks 14-16)

**Goal:** Public launch and initial user acquisition

**Deliverables:**
- [ ] Marketing website and landing page
- [ ] Launch communications plan
- [ ] User onboarding email sequences
- [ ] Customer support system setup
- [ ] Monitoring dashboards (uptime, performance, usage)
- [ ] Backup and disaster recovery plan
- [ ] Legal compliance (privacy policy, terms of service, GDPR)
- [ ] Payment integration (if applicable)
- [ ] Initial user acquisition campaigns
- [ ] Feedback collection system

**Success Criteria:**
- Successful public launch with zero downtime
- First 100+ active users onboarded
- < 5% error rate in production
- Positive user feedback and testimonials
- Clear support processes in place
- Metrics tracking and reporting functional

---

### Phase 6: AI Integration (Future Enhancement - Weeks 17+)

**Goal:** Add native AI features that genuinely accelerate workflow

**Note:** AI features are designed into the architecture from the start, so they'll feel native when implemented, not bolted-on.

**Deliverables:**
- [ ] Anthropic Claude API integration (Sonnet 4.5, Haiku 4.5, Opus 4.1)
- [ ] AI subject line generator (Tier 1 MVP feature)
- [ ] AI content drafter (Tier 1 MVP feature)
- [ ] AI alt text generator - automatic on image upload (Tier 1 MVP feature)
- [ ] AI copy optimizer (Tier 2 enhancement)
- [ ] AI layout recommendations (Tier 2 enhancement)
- [ ] AI personalization suggester (Tier 2 enhancement)
- [ ] Prompt engineering and optimization
- [ ] Error handling for AI failures with graceful fallbacks
- [ ] Usage tracking and cost optimization
- [ ] A/B testing AI-generated vs manual content

**Success Criteria:**
- AI generates relevant, high-quality subject lines (70%+ acceptance rate)
- AI drafts save users 3+ minutes per email
- Alt text is descriptive and accurate (90%+ accuracy)
- AI suggestions can be accepted/rejected smoothly
- AI features degrade gracefully when API unavailable
- User feedback indicates AI feels "native" not "added on"
- 60%+ adoption rate for AI features among active users

---

## 10. Success Metrics

### User Experience Metrics

**Time to First Email:**
- Target: < 5 minutes from account creation to first published email
- Measures: Onboarding effectiveness, UI clarity

**Edit Session Duration:**
- Target: 3-8 minutes average (fast enough to feel productive)
- Measures: Efficiency of editor workflow

**Feature Discovery Rate:**
- Target: 80% of users try AI features within first 3 emails
- Measures: Discoverability and perceived value of AI

**Error Rate:**
- Target: < 5% of email creation sessions encounter errors
- Measures: Stability and robustness

**Undo Usage:**
- Target: 20-30% of sessions use undo (healthy experimentation)
- Measures: User confidence and safety feeling

### Email Quality Metrics

**Email Client Compatibility:**
- Target: 99%+ of emails render correctly across top 10 clients
- Clients: Gmail (web, iOS, Android), Outlook (Windows, Mac, web), Apple Mail (iOS, macOS), Yahoo, AOL

**Mobile Rendering Score:**
- Target: 95%+ of emails render perfectly on mobile (no horizontal scroll, readable text)
- Measured via automated testing tools

**Accessibility Score:**
- Target: 90%+ of emails meet WCAG AA standards
- Checks: Alt text, color contrast, semantic HTML, link text

**Image Optimization:**
- Target: 100% of images compressed and correctly sized
- Measures: Cloudinary integration effectiveness

### AI Feature Adoption

**Subject Line Generator Usage:**
- Target: 60%+ of emails use AI-generated subject lines
- Measures: AI value and trust

**Content Drafter Usage:**
- Target: 40%+ of new emails start with AI draft
- Measures: AI usefulness for blank-page problem

**AI Acceptance Rate:**
- Target: 70%+ of AI suggestions accepted (with or without edits)
- Measures: AI quality and relevance

### Business Metrics

**User Retention:**
- Target: 70%+ of users return to create 2nd email within 7 days
- Measures: Product value and satisfaction

**Feature Utilization:**
- Target: 90%+ of users utilize at least 3 different block types
- Measures: Feature richness and discoverability

**Email Send Success Rate:**
- Target: 95%+ of test emails sent successfully via Resend
- Measures: Integration reliability

**Net Promoter Score (NPS):**
- Target: NPS > 50 (excellent for B2B SaaS)
- Measures: Overall user satisfaction and word-of-mouth potential

---

## Appendix A: Competitive Analysis

### Canva Email Editor
**Strengths:**
- Beautiful, approachable UI
- Massive template library
- Drag-and-drop feels magical
- Brand kit integration

**Weaknesses:**
- HTML export quality varies
- Not email-client optimized
- Too many features can overwhelm
- AI features feel tacked on

**Lessons:**
- Prioritize beauty and simplicity
- Templates lower barrier to entry
- Clear visual feedback for every action

### Mailchimp Email Builder
**Strengths:**
- Reliable email HTML generation
- Extensive email client testing
- Merge tags and personalization
- Integrated with email sending platform

**Weaknesses:**
- Design feels dated (circa 2015)
- Drag-and-drop is clunky
- Limited design flexibility
- Advanced features hidden

**Lessons:**
- Email compatibility is non-negotiable
- Merge tags/personalization are expected features
- Don't sacrifice reliability for design flexibility

### Figma (Inspiration, Not Direct Competitor)
**Strengths:**
- Incredibly powerful yet approachable
- Real-time collaboration
- Design systems and components
- Keyboard shortcuts for power users

**Weaknesses:**
- N/A (not an email tool)

**Lessons:**
- Contextual properties panel
- Consistent interaction patterns
- Progressive disclosure (simple by default, powerful when needed)
- Performance matters (60fps always)

### Beefree Email Editor
**Strengths:**
- Dedicated email editor (white-label)
- Good HTML output
- Mobile preview
- Content blocks and rows

**Weaknesses:**
- UI feels enterprise/corporate
- Limited AI features
- Not as intuitive as modern design tools

**Lessons:**
- Row + column structure works well for emails
- Separate mobile/desktop previews important
- HTML quality matters more than design flexibility

---

## Appendix B: Email-Safe Fonts

**Serif Fonts:**
- Georgia, Times, serif
- "Times New Roman", Times, serif
- "Palatino Linotype", "Book Antiqua", Palatino, serif

**Sans-Serif Fonts:**
- Arial, Helvetica, sans-serif
- "Arial Black", Gadget, sans-serif
- "Trebuchet MS", Helvetica, sans-serif
- Verdana, Geneva, sans-serif
- Tahoma, Geneva, sans-serif

**Monospace Fonts:**
- "Courier New", Courier, monospace
- Monaco, "Lucida Console", monospace

**Recommendation:**
- Default to Arial for body text (most compatible)
- Georgia for elegant headings
- Always include fallback fonts

---

## Appendix C: Mobile Preview Devices

**Priority Devices for Testing:**
1. iPhone 13/14/15 (375x812px) - iOS Mail, Gmail app
2. iPhone 13/14/15 Pro Max (428x926px) - larger screen variant
3. Samsung Galaxy S21/S22 (360x800px) - Android Gmail app
4. iPad (768x1024px) - tablet view
5. Pixel 5 (393x851px) - Android native email

**Preview Modes in Editor:**
- Mobile (375px width - iPhone standard) **DEFAULT**
- Desktop (640px width - optimal email width)
- Tablet (768px width - iPad)

---

## Appendix D: HTML Email Resources

**Testing Tools:**
- Litmus: https://www.litmus.com/
- Email on Acid: https://www.emailonacid.com/
- Mail Tester: https://www.mail-tester.com/ (spam score)

**Code References:**
- Can I email: https://www.caniemail.com/ (CSS support guide)
- Really Good Emails: https://reallygoodemails.com/ (inspiration)
- MJML Framework: https://mjml.io/ (responsive email framework - potential library)

**Best Practices:**
- Campaign Monitor CSS Guide: https://www.campaignmonitor.com/css/
- Litmus Community: https://litmus.com/community

---

## Conclusion

This email editor application has the potential to be the "Figma for email" - a beautiful, powerful, intuitive tool that makes creating professional emails genuinely enjoyable. By combining modern design principles with email-specific technical constraints, and thoughtfully integrating AI to accelerate (not replace) human creativity, we can build something that stands out in a crowded market.

**Key Success Factors:**
1. **Perfect the core editor first** - Nail drag-and-drop, design controls, and HTML generation before adding enhancements
2. **Mobile-first thinking** - 70% of emails open on mobile, so mobile preview is primary
3. **640px optimal width** - Maximum design space while maintaining perfect mobile scaling and universal compatibility
4. **Email HTML reliability** - Table-based layouts, inline styles, cross-client testing
5. **Canva-level design quality** - Beauty and simplicity throughout
6. **Figma-level interaction design** - Smooth, immediate feedback, powerful yet accessible
7. **Trust and safety** - Comprehensive undo, version history, auto-save
8. **AI designed for the future** - Architecture supports native AI integration when ready (Phase 6+)

**Next Steps:**
1. Review and refine this proposal with stakeholders
2. Create high-fidelity mockups of primary interface (Figma)
3. Build clickable prototype for user testing
4. Begin Phase 1 implementation (core editor, no AI)
5. Iterate based on user feedback throughout development

This is an ambitious but achievable project. With clear design direction, strong technical execution, and relentless focus on user experience, we can create an email editor that people genuinely love using.

---

## Document Updates

**Version 1.1 Updates (December 5, 2025):**
- **Updated email width from 600px to 640px** - Provides more design space while maintaining perfect mobile compatibility
- **Reprioritized roadmap** - AI features moved to Phase 6 (future enhancement) to focus on perfecting core editor first
- **Mobile rendering clarification** - Added detailed explanation of how 640px emails scale beautifully on high-resolution mobile devices
- **Architecture for future AI** - Designed UI structure (Saved Patterns section) to accommodate native AI integration when ready
- **Key principle added** - "Perfect the core editor first" now leads success factors

The proposal maintains all AI research and specifications for future implementation, but focuses initial development on the drag-and-drop editor, design controls, and bulletproof HTML generation.

---

**Document Version:** 1.1
**Last Updated:** December 5, 2025
**Author:** Design Agent
**Status:** Ready for Implementation - MVP Focus
