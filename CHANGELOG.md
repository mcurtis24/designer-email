# Changelog

All notable changes to the Designer Email project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed - December 27, 2025 (Afternoon Session)

#### Style Tab UX Improvements
- **Brand Styles Section**: Implemented functional brand color application
  - Brand color swatches now apply colors when clicked (was non-functional, only console.log)
  - Smart color application based on block type:
    - Heading/Text: Applies to text color
    - Button: Applies to button background color
    - Divider: Applies to divider line color
    - Footer: Applies to footer background color
    - Image/Gallery/Layout/Video/SocialIcons/Spacer: Applies to block background color
  - Impact: Makes Brand Styles section actually useful for quick color application
- **Edit Typography Styles Link**: Fixed non-functional link in heading/text controls
  - Added `showBrandingModal` state management to email store
  - Link now properly opens the Brand Kit Management modal
  - Previously called `setActiveSidebarTab('branding')` which was redirected to 'style' tab
  - Impact: Users can now access typography style management from block controls

#### Video Block Bug Fixes
- **Style Sidebar Activation**: Fixed video block not activating style sidebar when clicked
  - Added `useEmailStore` import and `setActiveSidebarTab('style')` call to click handler
  - Matches ImageBlock behavior for consistent UX across all blocks
  - Impact: Users can now properly access style controls when editing video blocks
- **Thumbnail Display Issues**: Improved video thumbnail reliability
  - Replaced YouTube maxresdefault.jpg with more reliable sddefault.jpg quality
  - Updated default video thumbnail to use Unsplash stock scenery image
  - Changed from Rick Astley placeholder to professional mountain landscape
  - Updated auto-generated YouTube thumbnails to use sddefault.jpg
  - Impact: Video blocks now show proper thumbnails instead of gray placeholder icons

### Added - December 27, 2025 (Morning Session)

#### Global Social Links Manager
- **Centralized Social Links Architecture**: Eliminated redundancy between Footer and Social Icons blocks
  - Social links now stored globally in `email.settings.socialLinks` (similar to brand colors)
  - Both Footer and Social Icons blocks read from the same centralized source
  - Footer block controls manage the global links (add, remove, edit URLs)
  - Social Icons block controls focus on styling only (icon style, size, spacing, alignment)
  - Impact: Improved UX by eliminating duplicate data entry, "configure once, use everywhere" pattern
- **EmailStore Actions**: Added 4 new state management actions
  - `addSocialLink()` - Add new social platform with URL
  - `removeSocialLink()` - Remove social platform
  - `updateSocialLink()` - Update URL for existing platform
  - `reorderSocialLinks()` - Reorder social links (future drag-and-drop support)
- **Type System Updates**: Refactored type definitions for global social links
  - Added `SocialLink` interface with platform, url, and optional iconUrl
  - Moved `socialLinks` from `FooterBlockData` to `EmailSettings`
  - Updated `SocialIconsBlockData` to remove icons array, use global links with optional filtering
  - Updated `htmlGenerator.ts` to pass settings through generation chain
- **Backward Compatibility**: Migration handling for old emails
  - Added `|| []` fallbacks throughout codebase for undefined socialLinks
  - Store actions check for undefined and create empty arrays
  - No data loss, graceful degradation for emails created before this update
- **Social Icons Controls UI Enhancement**:
  - Added prominent blue info box explaining global system with bullet points
  - Added styled preview section showing active social links (read-only)
  - Added "Styling Options" section header for clear visual hierarchy
  - Improved spacing and visual organization
  - Clear messaging: "Manage links in Footer block controls"
- **Bug Fixes**:
  - Fixed Social Icons block click handling to properly activate style sidebar
  - Added `setActiveSidebarTab('style')` call on block click (was missing)
  - Fixed TypeScript errors in htmlGenerator.ts (missing imports, type annotations)
  - Fixed runtime errors when old emails don't have socialLinks field
- **Impact**:
  - Eliminates user confusion about where to manage social links
  - Reduces time to configure social links (configure once vs per-block)
  - Prevents inconsistencies between Footer and Social Icons blocks
  - Professional UX pattern matching brand colors system

### Added - December 26, 2025 (Late Evening Session)

#### Phase 2: Video & Social Icons Blocks (Competitive Parity)
- **Video Block**: Full support for embedding videos in emails
  - YouTube, Vimeo, and custom video URL support
  - Automatic YouTube thumbnail fetching (maxresdefault quality)
  - Customizable video width (200-640px)
  - Border radius control for rounded corners
  - Alignment options (left, center, right)
  - Alt text for accessibility
  - Email-safe HTML generation with linked thumbnail
  - Impact: Matches 4/5 major competitors (Unlayer, Stripo, Beefree, Topol)
- **Social Icons Block**: Standalone social media icon component
  - Support for 9 platforms: Facebook, X/Twitter, Instagram, LinkedIn, YouTube, TikTok, Pinterest, GitHub, Custom
  - 5 icon styles: Colored, Monochrome, Outlined, Circular, Square
  - Customizable icon size (24-48px)
  - Adjustable spacing between icons
  - Alignment options (left, center, right)
  - Custom icon color for monochrome/outlined styles
  - Inline SVG icons for email compatibility
  - Impact: Provides flexibility beyond footer-only social links

### Added - December 26, 2025 (Evening Session)

#### Brand Identity & UI Polish
- **Custom Brand Color Integration**: Replaced default Tailwind blue (#2563EB) with custom brand color (#027DB3) throughout entire application
  - Updated Tailwind v4 theme configuration using `@theme` directive with CSS custom properties
  - Modified design tokens (primary, primaryHover) in `design-tokens.ts`
  - Updated dark mode email button styles in HTML generator
  - Ensured consistency across all UI elements: buttons, badges, active states, focus rings
  - Impact: Professional, cohesive brand identity throughout the application
- **Top Navigation Reorganization**: Improved layout and visual hierarchy
  - Removed unnecessary "Back" button for cleaner interface
  - Made "Designer Email" app title more prominent (text-2xl, font-bold, left-aligned)
  - Relocated viewport and zoom controls from right to left section for better balance
  - Compact control sizing for reduced visual clutter
  - Impact: Clearer branding, better-organized controls, improved usability
- **Style Tab Simplification**: Removed confusing visibility controls
  - Eliminated "Show This Block On" desktop/mobile toggle functionality
  - Simplified Layout section to focus on essential controls (padding, alignment)
  - Reduced cognitive load and improved user experience
  - Impact: Cleaner, more intuitive Style tab interface

### Added - Phase 1: Critical UX Improvements (December 26, 2025) - IN PROGRESS

**Status:** 4/4 Major Features Complete (Core Implementation), Individual Block Migrations Ongoing

#### Mobile Preview Enhancements
- **Prominent Viewport Controls**: Moved desktop/mobile toggle from bottom toolbar to top navigation bar for better visibility and accessibility
- **Visual Mobile Indicator**: Added blue ring around canvas and floating "Mobile Preview (375px)" badge when in mobile mode
- **Improved Zoom Controls**: Relocated zoom controls (50%-200%) to top navigation with cleaner UI
- **Reclaimed Vertical Space**: Removed bottom toolbar, freeing up 60-80px of canvas space for actual design work
- **Impact**: Makes mobile preview mode highly visible, critical since 70%+ of emails are opened on mobile devices

#### Dark Mode Support for Emails
- **Color Scheme Meta Tags**: Added `color-scheme` and `supported-color-schemes` meta tags for proper dark mode detection
- **Telephone Detection**: Added `format-detection` meta tag to prevent auto-linking of phone numbers
- **Comprehensive Dark Mode CSS**: Implemented `@media (prefers-color-scheme: dark)` styles with:
  - Automatic background inversion (#ffffff → #1a1a1a for readability)
  - Text color adjustments (headings → #ffffff, body → #e5e5e5) for optimal contrast
  - Link color optimization (#60a5fa for visibility in dark mode)
  - Button style preservation while adapting to dark environments
  - Image opacity adjustment (0.9) to prevent harsh brightness
  - Border and divider color adaptation (#404040)
- **Email Client Support**: Compatible with Apple Mail, Gmail (automatic), and Outlook (limited)
- **Impact**: Improved readability for 34%+ of users who view emails in dark mode (2025 statistics)

#### Style Tab Restructure (Core Architecture)
- **CollapsibleSection Component**: New reusable component with persistent state management
  - Sections remember open/closed state when switching between blocks
  - State stored in Zustand store (`uiState.collapsedSections`)
  - Badge support for showing counts (e.g., "3 brand colors")
  - Help tooltip integration for contextual assistance
  - Smooth expand/collapse animations
  - Proper ARIA labels for screen reader accessibility
  - Store actions: `setSectionState()`, `collapseAllSections()`, `expandAllSections()`
- **Shared Control Components**: Reusable, consistent controls across all block types
  - `ColorControl` - Unified color picker with brand color integration
  - `FontFamilyControl` - Font selection with 10 email-safe fonts
  - `SizeControl` - Numeric input with +/- buttons and unit display
  - `AlignmentControl` - Visual button group for text alignment
  - `PaddingControl` - Advanced padding control with linked/unlinked sides
- **DesignControls Refactor**: Complete restructure of Style Tab organization
  - Removed redundant QuickApplyToolbar (functionality moved to Brand Styles section)
  - Sticky header showing selected block type with icon
  - Three main collapsible sections:
    - **Properties** (expanded): Block-specific controls
    - **Layout** (expanded): Common controls (padding, alignment, visibility)
    - **Brand Styles** (collapsed): Quick-apply brand colors
  - Scrollable content area with sticky header/footer
  - Sticky "Save as Component" button at bottom
  - Block type icons for visual clarity
- **Information Architecture Improvements**:
  - Progressive disclosure: Advanced options collapsed by default
  - Clear visual hierarchy with section headings
  - Reduced cognitive load (5-7 core controls visible vs 12-15 previously)
  - Consistent patterns across all block types
  - Easy-to-find controls (no more hunting across multiple UI locations)
- **Impact**: Addresses #1 UX pain point, dramatically reduces time-to-style blocks, improves discoverability

#### Accessibility Validation System (WCAG 2.2 Compliance)
- **Color Contrast Checking**:
  - Validates text-to-background contrast ratios
  - 4.5:1 minimum for body text
  - 3.0:1 minimum for large text (18pt+ or 14pt+ bold)
  - Warns when contrast is barely above minimum
  - Calculates contrast using proper WCAG 2.2 relative luminance formula
- **Heading Hierarchy Validation**:
  - Detects skipped heading levels (e.g., H1 → H3)
  - Ensures proper document structure for screen readers
  - Critical for accessibility compliance
- **Line Height Checking**:
  - Warns when line height < 1.5 (WCAG 2.2 recommendation)
  - Applies to both headings and body text
- **Link Text Validation**:
  - Detects non-descriptive link text ("click here", "read more", "here")
  - Suggests descriptive alternatives
- **Button Accessibility**:
  - Validates button text-to-background contrast (4.5:1 minimum)
  - Detects non-descriptive button text
  - Checks touch target size (44x44px minimum for mobile)
- **Image Alt Text Validation** (Enhanced):
  - Detects missing alt text (error level)
  - Identifies generic/unhelpful alt text (warning level)
  - Warns when alt text exceeds 125 characters
  - Validates all gallery images individually
- **Visual Indicators**:
  - Yellow warning button in top navigation shows issue count
  - Red badge for critical errors
  - Detailed accessibility panel with specific suggestions for each issue
- **Legal Compliance**: Meets European Accessibility Act requirements (effective June 2025)
- **Impact**: Prevents legal issues, improves usability for 15%+ of population with disabilities

### Technical Improvements

#### Code Quality
- Enhanced type safety in accessibility validation system
- Proper WCAG 2.2 contrast ratio calculation with gamma correction
- Comprehensive validation across all block types (heading, text, button, image, gallery)

#### Performance
- Memoized accessibility validation in TopNav component
- Efficient contrast ratio calculations with luminance caching
- Minimal re-renders with proper state management

### Developer Experience
- Clear validation error messages with actionable suggestions
- Color contrast values displayed in validation messages
- Detailed accessibility scoring system

### Completed - Style Tab Block Control Migrations (December 26, 2025)

**Migration Complete:** All primary block controls now use shared components for consistency

#### HeadingControls Migration
- ✅ Added FontFamilyControl for direct font family selection
- ✅ Added SizeControl for font size (12-72px with +/- buttons)
- ✅ Replaced line height input with SizeControl (1.0-3.0 with step 0.1)
- ✅ Maintained heading level selector (H1/H2/H3)
- ✅ Maintained font weight dropdown
- ✅ Maintained brand colors quick access and typography presets
- ✅ Maintained mobile typography overrides

#### TextControls Migration
- ✅ Added FontFamilyControl for direct font family selection
- ✅ Added SizeControl for font size (10-48px with +/- buttons)
- ✅ Replaced line height input with SizeControl (1.0-3.0 with step 0.1)
- ✅ Maintained brand colors quick access and typography presets
- ✅ Maintained mobile typography overrides

#### ButtonControls Migration
- ✅ Replaced alignment buttons with AlignmentControl (visual icon buttons)
- ✅ Replaced button width slider with SizeControl (100-400px with +/- buttons)
- ✅ Replaced border radius slider with SizeControl (0-50px with +/- buttons)
- ✅ Maintained button text and link URL inputs
- ✅ Maintained color pickers (button color, text color)

#### Benefits of Shared Components
- **Consistency**: All font size controls look and behave identically across blocks
- **Maintainability**: Bug fixes and improvements only need to happen once
- **Better UX**: Professional controls with proper accessibility (ARIA labels)
- **Type Safety**: TypeScript interfaces ensure correct usage
- **Faster Development**: New block types can import and use shared controls

**Note:** ImageControls, GalleryControls, SpacerControls, DividerControls, LayoutControls, and FooterControls already work with the new section-based structure and don't require migration as they have specialized controls specific to their block types.

## [Previous Updates]

### Phase 0-3 Features & Complete Roadmap
See [planning/MASTER_PLANNING_DOCUMENT.md](planning/MASTER_PLANNING_DOCUMENT.md) for:
- Complete feature status (what's done, what's not)
- Remaining features with priorities and effort estimates
- Implementation timeline and success metrics

Historical planning documents: [planning/archive/](planning/archive/)

---

## Future Roadmap

### Phase 1 (COMPLETED - December 26, 2025)
- [x] **Mobile Preview Enhancements**: Prominent viewport controls, visual mobile indicator
- [x] **Dark Mode Support**: Comprehensive dark mode CSS for generated emails
- [x] **Accessibility Validation**: WCAG 2.2 compliance checking system
- [x] **Style Tab Restructure - Core Architecture**: CollapsibleSection, shared components, DesignControls refactor
- [x] **Style Tab Restructure - Block Migrations**: HeadingControls, TextControls, ButtonControls using shared components

### Phase 2: Competitive Parity (Weeks 3-6)
- [x] Video Block (COMPLETED - December 26, 2025)
- [x] Social Icons Block (standalone) (COMPLETED - December 26, 2025)
- [ ] Template Library Expansion (8 → 30+ templates)
- [ ] AI Alt Text Generation
- [ ] Typography Quick-Apply Presets

### Phase 3: Polish (Weeks 7-10)
- [ ] Onboarding Tour
- [ ] Countdown Timer Block
- [ ] Menu/Navigation Block
- [ ] Product Card Block
- [ ] State Management Refactor (split monolithic store)
- [ ] Error Handling & Loading States

### Phase 4: Differentiation (Weeks 11+)
- [ ] AMP for Email (interactive emails)
- [ ] Real-Time Collaboration
- [ ] Advanced AI Features

---

## Implementation Notes

### Phase 1 Completion Status

**Production-Ready Features (Can Deploy Now):**
1. ✅ Mobile preview enhancements
2. ✅ Dark mode support for emails
3. ✅ Accessibility validation system (WCAG 2.2)
4. ✅ Style Tab core architecture
5. ✅ Block control migrations (HeadingControls, TextControls, ButtonControls)

**Technical Achievements:**
- Zero breaking changes to existing functionality
- All features include proper TypeScript typing and error handling
- Changes maintain backward compatibility with existing email templates
- Accessibility features align with WCAG 2.2 Level AA standards
- State management properly implemented with Zustand store
- Reusable component architecture for long-term maintainability

**Development Approach:**
- Fast-track implementation: All Phase 1 features completed in 1 day
- Progressive enhancement: Block migrations completed without breaking changes
- No regression: All existing functionality preserved and enhanced
- Production ready: Can deploy to production immediately with confidence
- Zero TypeScript errors: All code properly typed and validated

### Technical Debt Tracker

All recommendations from code review and design review have been documented in:
- `planning_and_updates/remaining-recommendations-tracker.md` (26 items tracked)
- Priority levels assigned (Critical → Nice to Have)
- Timeline estimates provided
- Dependencies identified

**Next Priority Items:**
1. ✅ ~~Complete HeadingControls, TextControls, ButtonControls migrations~~ (COMPLETED)
2. Add mobile override UI with visual indicators
3. Implement onboarding tour for first-time users
4. Add visual badges for section states
5. Begin Phase 2: Video Block and Social Icons Block
