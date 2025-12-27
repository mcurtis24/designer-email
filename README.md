# Designer Email

A modern, professional email design tool built with React, TypeScript, and Tailwind CSS. Create beautiful, responsive, and accessible HTML emails with an intuitive drag-and-drop interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-blue)](https://tailwindcss.com/)

## Features

### Core Functionality

**Visual Email Builder**
- Drag-and-drop interface for intuitive email design
- Real-time preview with instant visual feedback
- Mobile-first responsive design approach
- Professional email-safe HTML generation

**Rich Content Blocks**
- **Heading Block** - H1, H2, H3 with full typography control
- **Text Block** - Rich text editing with bold, italic, underline, and links
- **Image Block** - Cloudinary integration with alt text and responsive sizing
- **Image Gallery** - 2-4 column layouts with customizable gaps
- **Button Block** - Call-to-action buttons with full styling control
- **Layout Block** - Multi-column layouts (1-4 columns) with flexible ratios
- **Footer Block** - Complete footer with social links, company info, and legal text
- **Spacer Block** - Vertical spacing control
- **Divider Block** - Horizontal rules with style customization

### Mobile Preview & Responsive Design

- **Prominent Viewport Controls** - Easy desktop/mobile/tablet switching
- **Visual Mobile Indicator** - Blue ring and badge when in mobile mode
- **Zoom Controls** - 50%-200% zoom for precise editing
- **Mobile Overrides** - Separate typography, padding, and alignment for mobile devices
- **Automatic Stacking** - Columns stack vertically on mobile for optimal readability
- **375px Mobile Preview** - iPhone standard viewport for accurate mobile testing

### Dark Mode Support

- **Automatic Dark Mode Detection** - Emails adapt to user's system preferences
- **Smart Color Inversion** - Background and text colors automatically adjust
- **Optimized Contrast** - Ensures readability in both light and dark modes
- **Image Opacity** - Subtle image dimming prevents harsh brightness
- **Email Client Support** - Compatible with Apple Mail, Gmail, and Outlook

### Accessibility (WCAG 2.2 Compliance)

- **Color Contrast Validation** - Ensures 4.5:1 ratio for body text, 3.0:1 for large text
- **Heading Hierarchy Check** - Detects skipped heading levels (H1 → H3)
- **Line Height Validation** - Warns when line height < 1.5
- **Link Text Analysis** - Identifies non-descriptive links ("click here", "read more")
- **Alt Text Validation** - Detects missing or generic alt text
- **Button Accessibility** - Validates contrast and touch target size (44x44px minimum)
- **Real-time Feedback** - Visual indicators with actionable suggestions

### Advanced Styling System

**Collapsible Style Tab**
- Organized into logical sections: Properties, Layout, Brand Styles
- Sections remember open/closed state when switching blocks
- Reduced cognitive load with progressive disclosure

**Shared Control Components**
- `ColorControl` - Unified color picker with brand color integration
- `FontFamilyControl` - 10 email-safe fonts
- `SizeControl` - Numeric input with +/- buttons
- `AlignmentControl` - Visual text alignment buttons
- `PaddingControl` - Linked/unlinked padding sides

**Brand Kit Integration**
- Save unlimited brand colors with custom names
- Document color extraction from existing blocks
- Quick-apply brand colors throughout design
- Typography style presets (heading, body)

### Template System

- **Pre-built Templates** - Newsletter, promotion, announcement, welcome, event, and more
- **Save as Template** - Convert any design into a reusable template
- **Template Categories** - Organized filtering and search
- **Thumbnail Previews** - Auto-generated visual previews
- **Version History** - Track changes and revert to previous versions (max 10)

### Saved Components

- **Save Any Block** - Convert blocks into reusable components
- **Component Library** - Personal library of frequently-used designs
- **One-click Import** - Drag saved components into any email
- **Categories** - Organize components (Headers, CTAs, Footers, etc.)

### Export & Integration

- **HTML Export** - Clean, email-safe HTML with inline styles
- **Email Client Compatible** - Tested with major email clients
- **Responsive Meta Tags** - Mobile optimization and dark mode support
- **Table-based Layouts** - Rock-solid compatibility across all clients

### Real-time Editing

- **Inline Text Editing** - Click to edit headings and text blocks
- **Canvas Toolbar** - Floating formatting toolbar during editing
- **Undo/Redo** - Full history with keyboard shortcuts (Cmd/Ctrl+Z)
- **Auto-save** - Automatic saving to prevent data loss
- **Manual Checkpoints** - Create named save points

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Rich Text**: ContentEditable with custom toolbar
- **Image Uploads**: Cloudinary integration
- **Build Tool**: Vite 7.2
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/mcurtis24/designer-email.git

# Navigate to project directory
cd designer-email

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Project Structure

```
designer-email/
├── src/
│   ├── components/
│   │   ├── blocks/          # Email content blocks
│   │   ├── controls/        # Style controls for each block type
│   │   ├── layout/          # Main layout components
│   │   └── ui/              # Reusable UI components
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Utilities and helpers
│   │   ├── htmlGenerator.ts # HTML email export
│   │   ├── colorUtils.ts    # Color extraction & validation
│   │   └── design-tokens.ts # Design system tokens
│   └── styles/              # Global CSS and Tailwind config
├── public/                  # Static assets
└── planning_and_updates/    # Project documentation
```

## Key Features in Detail

### Mobile-First Design

Designer Email is built with a mobile-first philosophy. Since 70%+ of emails are opened on mobile devices, we prioritize mobile experience:

- Default mobile viewport on startup
- Visual indicators when in mobile mode
- Mobile-specific typography and padding overrides
- Automatic column stacking on small screens
- Touch-friendly 44px minimum button size

### Email Client Compatibility

All generated HTML is tested and optimized for:

- Gmail (Desktop & Mobile)
- Apple Mail (macOS & iOS)
- Outlook (2016, 2019, Office 365)
- Yahoo Mail
- Proton Mail
- Thunderbird

We use table-based layouts, inline styles, and email-safe CSS to ensure maximum compatibility.

### Accessibility First

Designer Email helps you create accessible emails that comply with WCAG 2.2 Level AA standards:

- Real-time contrast ratio checking
- Heading structure validation
- Alt text recommendations
- Link text quality analysis
- Button accessibility validation

This ensures your emails are usable by everyone, including people with disabilities, and helps you meet legal requirements like the European Accessibility Act (effective June 2025).

### Professional Workflow

**Undo/Redo**: Full history tracking with keyboard shortcuts
**Auto-save**: Never lose your work with automatic saving
**Templates**: Start with professional templates or save your own
**Components**: Build a library of reusable blocks
**Version History**: Track changes and revert when needed

## Roadmap

### Phase 2: Competitive Parity (Q1 2025)
- Video Block with thumbnail and play button
- Social Icons Block (standalone)
- Template Library Expansion (30+ templates)
- AI Alt Text Generation
- Typography Quick-Apply Presets

### Phase 3: Polish (Q2 2025)
- Interactive Onboarding Tour
- Countdown Timer Block
- Menu/Navigation Block
- Product Card Block
- State Management Refactor
- Enhanced Error Handling

### Phase 4: Differentiation (Q3 2025)
- AMP for Email (interactive emails)
- Real-Time Collaboration
- Advanced AI Features
- Email Campaign Analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by leading email design tools like Beefree and Unlayer
- Designed for professional email marketers and developers

## Contact

Michael Curtis - [@mcurtis24](https://github.com/mcurtis24)

Project Link: [https://github.com/mcurtis24/designer-email](https://github.com/mcurtis24/designer-email)

---

**Made with ❤️ using React, TypeScript, and Tailwind CSS**
