/**
 * Design System Tokens
 * Based on email-editor-design-proposal.md specifications
 */

export const colors = {
  // Brand colors
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#DBEAFE',

  // Neutrals (UI)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

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
} as const

export const typography = {
  // UI fonts (app interface)
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
    '5xl': '48px',
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
} as const

export const spacing = {
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
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const

export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

// Email-specific constants
export const emailConstants = {
  contentWidth: 640, // px - optimal email width
  mobileViewport: 375, // px - iPhone standard
  desktopViewport: 640, // px - email standard
  tabletViewport: 768, // px - iPad

  // Minimum sizes for mobile-first design
  minFontSize: 16, // px - minimum for body text
  minButtonHeight: 44, // px - minimum touch target
  minButtonWidth: 44, // px - minimum touch target

  // Recommended defaults
  defaultPadding: '20px',
  defaultMargin: '0px',
  defaultLineHeight: 1.5,
} as const

// Type exports for TypeScript
export type Color = keyof typeof colors
export type FontSize = keyof typeof typography.fontSize
export type FontWeight = keyof typeof typography.fontWeight
export type Spacing = keyof typeof spacing
export type Shadow = keyof typeof shadows
export type BorderRadius = keyof typeof borderRadius
