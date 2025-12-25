/**
 * HTML Generation Engine
 * Converts email blocks to email-safe HTML (600px, table-based, inline styles)
 * Based on email-editor-design-proposal.md specifications
 *
 * HYBRID RENDERING APPROACH:
 * -------------------------
 * This generator uses MSO (Microsoft Office) conditional comments to serve different
 * HTML to different email clients:
 *
 * - Modern Clients (Gmail, Apple Mail, Yahoo, Hey, Outlook.com):
 *   Get beautiful, modern HTML with object-fit, flexbox support, max-width, etc.
 *
 * - Outlook Desktop 2007-2019 (uses Word rendering engine):
 *   Gets bulletproof table-based fallbacks with VML where needed.
 *
 * Example conditional syntax:
 *   <!--[if mso]> Outlook-specific code <![endif]-->
 *   <!--[if !mso]><!--> Modern client code <!--<![endif]-->
 *
 * This ensures emails look GREAT in Gmail while still working in Outlook.
 */

import type {
  EmailDocument,
  EmailBlock,
  HeadingBlockData,
  TextBlockData,
  ImageBlockData,
  ImageGalleryBlockData,
  ButtonBlockData,
  SpacerBlockData,
  DividerBlockData,
  LayoutBlockData,
  FooterBlockData,
} from '@/types/email'
import {
  isValidCSSLength,
  isValidCSSColor,
  isValidTextAlign,
  isValidLineHeight,
} from './utils/cssValidator'

// Helper to generate inline padding style
function getPaddingStyle(padding?: any): string {
  if (!padding) return ''
  return `padding: ${padding.top} ${padding.right} ${padding.bottom} ${padding.left};`
}

/**
 * Generate mobile media query styles for a block with mobile overrides
 * Returns empty string if no mobile overrides exist
 */
function generateMobileMediaQuery(block: EmailBlock, blockId: string): string {
  const { styles } = block
  const rules: string[] = []

  // Get block type-specific mobile overrides
  let mobileFontSize: string | undefined
  let mobileLineHeight: string | number | undefined
  let elementTag = 'td'

  if (block.type === 'heading') {
    const data = block.data as HeadingBlockData
    mobileFontSize = data.mobileFontSize
    mobileLineHeight = data.mobileLineHeight
    elementTag = `h${data.level}`
  } else if (block.type === 'text') {
    const data = block.data as TextBlockData
    mobileFontSize = data.mobileFontSize
    mobileLineHeight = data.mobileLineHeight
  }

  // Typography overrides (heading or text blocks)
  if ((mobileFontSize && isValidCSSLength(mobileFontSize)) ||
      (mobileLineHeight && isValidLineHeight(mobileLineHeight))) {
    const typographyRules: string[] = []

    if (mobileFontSize && isValidCSSLength(mobileFontSize)) {
      typographyRules.push(`font-size: ${mobileFontSize} !important;`)
    }

    if (mobileLineHeight && isValidLineHeight(mobileLineHeight)) {
      const lineHeightValue = typeof mobileLineHeight === 'number'
        ? mobileLineHeight.toString()
        : mobileLineHeight
      typographyRules.push(`line-height: ${lineHeightValue} !important;`)
    }

    if (typographyRules.length > 0) {
      rules.push(`#${blockId} ${elementTag} {
        ${typographyRules.join('\n        ')}
      }`)
    }
  }

  // Check for mobile style overrides (padding, alignment, background)
  const mobileStyles = styles.mobileStyles
  if (mobileStyles) {
    const tdRules: string[] = []

    // Padding override
    if (mobileStyles.padding) {
      const p = mobileStyles.padding
      tdRules.push(`padding: ${p.top} ${p.right} ${p.bottom} ${p.left} !important;`)
    }

    // Text alignment override
    if (mobileStyles.textAlign && isValidTextAlign(mobileStyles.textAlign)) {
      tdRules.push(`text-align: ${mobileStyles.textAlign} !important;`)
    }

    // Background color override
    if (mobileStyles.backgroundColor && isValidCSSColor(mobileStyles.backgroundColor)) {
      tdRules.push(`background-color: ${mobileStyles.backgroundColor} !important;`)
    }

    if (tdRules.length > 0) {
      rules.push(`#${blockId} > tr > td {
        ${tdRules.join('\n        ')}
      }`)
    }
  }

  // If no mobile overrides, return empty string
  if (rules.length === 0) return ''

  // Return mobile media query with all rules
  return `  <style type="text/css">
    @media only screen and (max-width: 639px) {
      ${rules.join('\n      ')}
    }
  </style>
`
}

// Generate HTML for a heading block
function generateHeadingHTML(block: EmailBlock): string {
  const data = block.data as HeadingBlockData
  const { styles } = block

  // Generate unique ID for mobile targeting
  const blockId = `heading-${block.id}`

  // Build class list for visibility controls
  const classes = []
  if (styles.hideOnMobile) classes.push('mobile-hide')
  if (styles.hideOnDesktop) classes.push('desktop-hide')
  const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : ''

  // Generate mobile media query if mobile overrides exist
  const mobileMediaQuery = generateMobileMediaQuery(block, blockId)

  return `${mobileMediaQuery}<table id="${blockId}" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"${classAttr}>
  <tr>
    <td style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''} text-align: ${styles.textAlign || 'center'};">
      <h${data.level} style="margin: 0; font-family: ${data.fontFamily}; font-size: ${data.fontSize}; font-weight: ${data.fontWeight}; color: ${data.color}; line-height: ${data.lineHeight};">
        ${data.text}
      </h${data.level}>
    </td>
  </tr>
</table>`
}

// Generate HTML for a text block
function generateTextHTML(block: EmailBlock): string {
  const data = block.data as TextBlockData
  const { styles } = block

  // Generate unique ID for mobile targeting
  const blockId = `text-${block.id}`

  // Build class list for visibility controls
  const classes = []
  if (styles.hideOnMobile) classes.push('mobile-hide')
  if (styles.hideOnDesktop) classes.push('desktop-hide')
  const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : ''

  // Generate mobile media query if mobile overrides exist
  const mobileMediaQuery = generateMobileMediaQuery(block, blockId)

  return `${mobileMediaQuery}<table id="${blockId}" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"${classAttr}>
  <tr>
    <td style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''} font-family: ${data.fontFamily}; font-size: ${data.fontSize}; line-height: ${data.lineHeight}; color: ${data.color}; text-align: ${styles.textAlign || 'left'};">
      ${data.content}
    </td>
  </tr>
</table>`
}

// Generate HTML for an image block
function generateImageHTML(block: EmailBlock): string {
  const data = block.data as ImageBlockData
  const { styles } = block

  const imageStyle = `display: block; max-width: 100%; height: auto; border: 0; ${data.borderRadius ? `border-radius: ${data.borderRadius}px;` : ''} ${data.width ? `width: ${data.width}px;` : ''}`

  const imageTag = `<img src="${data.src}" alt="${data.alt}" style="${imageStyle}" />`

  const content = data.linkUrl
    ? `<a href="${data.linkUrl}" target="_blank" rel="noopener noreferrer">${imageTag}</a>`
    : imageTag

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="${data.alignment}" style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      ${content}
    </td>
  </tr>
</table>`
}

// Generate HTML for a gallery block
function generateGalleryHTML(block: EmailBlock): string {
  const data = block.data as ImageGalleryBlockData
  const { styles } = block

  const columns = data.layout === '2-col' ? 2 : data.layout === '3-col' ? 3 : 4
  const gap = data.gap || 8

  // Filter out empty images
  const validImages = data.images.filter(img => img.src)

  if (validImages.length === 0) {
    return `<!-- Gallery block with no images -->`
  }

  // Chunk images into rows
  const rows: typeof validImages[] = []
  for (let i = 0; i < validImages.length; i += columns) {
    rows.push(validImages.slice(i, i + columns))
  }

  // Calculate fixed square dimensions (1:1 aspect ratio)
  // CRITICAL: Cell widths must account for padding-right being INSIDE the width
  // Non-last cells include gap in width, last cell doesn't
  const imageSize = columns === 2 ? 280 : columns === 3 ? 186 : 140

  // Only add mobile-full-width class if stackOnMobile is true (default)
  const mobileClass = data.stackOnMobile !== false ? 'mobile-full-width' : ''

  // Generate HTML for each row
  const rowsHTML = rows.map((rowImages, rowIndex) => {
    const isLastRow = rowIndex === rows.length - 1
    const cellsHTML = rowImages.map((image, cellIndex) => {
      const isLastInRow = cellIndex === rowImages.length - 1
      const borderRadiusStyle = (image as any).borderRadius ? `border-radius: ${(image as any).borderRadius}px;` : ''
      const objectPosition = image.objectPosition || '50% 50%'

      // Cell width calculation: non-last cells include gap, last cell doesn't
      // This ensures consistent column widths across all rows
      const cellWidth = isLastInRow ? imageSize : imageSize + gap

      // HYBRID APPROACH for gallery images:
      // - Modern clients: Use object-fit: cover with exact square dimensions for perfect cropping
      // - Outlook: Use explicit width/height attributes for consistent sizing
      // All images use square (1:1) aspect ratio for exactly equal dimensions
      const modernImageTag = `<img src="${image.src}" alt="${image.alt}" width="${imageSize}" height="${imageSize}" style="display: block; width: ${imageSize}px; height: ${imageSize}px; object-fit: cover; object-position: ${objectPosition}; border: 0; ${borderRadiusStyle}" />`
      const outlookImageTag = `<img src="${image.src}" alt="${image.alt}" width="${imageSize}" height="${imageSize}" style="display: block; border: 0; ${borderRadiusStyle}" />`

      const modernContent = image.linkUrl
        ? `<a href="${image.linkUrl}" target="_blank" rel="noopener noreferrer" style="display: block; line-height: 0; ${borderRadiusStyle} overflow: hidden;">${modernImageTag}</a>`
        : `<div style="line-height: 0; ${borderRadiusStyle} overflow: hidden;">${modernImageTag}</div>`

      const outlookContent = image.linkUrl
        ? `<a href="${image.linkUrl}" target="_blank" rel="noopener noreferrer">${outlookImageTag}</a>`
        : outlookImageTag

      // Use conditional comments for hybrid rendering
      const content = `
        <!--[if mso]>
        ${outlookContent}
        <![endif]-->
        <!--[if !mso]><!-->
        ${modernContent}
        <!--<![endif]-->
      `

      // Apply full gap via padding-right on non-last cells (original approach)
      return `<td ${mobileClass ? `class="${mobileClass}"` : ''} align="center" valign="top" width="${cellWidth}" style="width: ${cellWidth}px;${isLastInRow ? '' : ` padding-right: ${gap}px;`}">
        ${content}
      </td>`
    }).join('\n')

    // Add gap row between rows (original approach for vertical spacing)
    return `<tr>
      ${cellsHTML}
    </tr>${isLastRow ? '' : `<tr><td colspan="${columns}" style="height: ${gap}px; line-height: ${gap}px; font-size: 0;">&nbsp;</td></tr>`}`
  }).join('\n')

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${rowsHTML}
      </table>
    </td>
  </tr>
</table>`
}

// Generate HTML for a button block
function generateButtonHTML(block: EmailBlock): string {
  const data = block.data as ButtonBlockData
  const { styles } = block

  // Calculate border radius percentage for VML (Outlook)
  const borderRadiusPercent = data.width ? Math.round((data.borderRadius / data.width) * 100) : 0

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="${data.alignment}" style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                   xmlns:w="urn:schemas-microsoft-com:office:word"
                   href="${data.linkUrl}"
                   style="height:44px;v-text-anchor:middle;width:${data.width || 200}px;"
                   arcsize="${borderRadiusPercent}%"
                   strokecolor="${data.backgroundColor}"
                   fillcolor="${data.backgroundColor}">
        <w:anchorlock/>
        <center style="color:${data.textColor};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">
          ${data.text}
        </center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${data.linkUrl}" target="_blank" rel="noopener noreferrer" style="background-color: ${data.backgroundColor}; border: 2px solid ${data.backgroundColor}; border-radius: ${data.borderRadius}px; color: ${data.textColor}; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; line-height: 44px; text-align: center; text-decoration: none; width: ${data.width || 200}px; -webkit-text-size-adjust: none;">
        ${data.text}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`
}

// Generate HTML for a spacer block
function generateSpacerHTML(block: EmailBlock): string {
  const data = block.data as SpacerBlockData
  const { styles } = block

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="height: ${data.height}px; line-height: ${data.height}px; font-size: 0; ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      &nbsp;
    </td>
  </tr>
</table>`
}

// Generate HTML for a divider block
function generateDividerHTML(block: EmailBlock): string {
  const data = block.data as DividerBlockData
  const { styles } = block

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      <hr style="width: ${data.width || '100%'}; height: 0; border: none; border-top: ${data.thickness || 1}px ${data.style || 'solid'} ${data.color || '#e5e7eb'}; margin: 0; padding: 0;" />
    </td>
  </tr>
</table>`
}

// Generate HTML for a layout/row block
function generateLayoutHTML(block: EmailBlock): string {
  const data = block.data as LayoutBlockData
  const { styles } = block

  if (data.children.length === 0) {
    return `<!-- Empty layout block -->`
  }

  const gap = data.gap || 16
  const totalWidth = 600

  // Calculate column widths based on ratio
  // NOTE: For email HTML, padding-right is INSIDE the column width
  // So we need to add the gap to the first column's width
  let columnWidths: number[] = []

  if (data.columns === 1) {
    columnWidths = [totalWidth]
  } else if (data.columns === 2) {
    // For 2-column layouts, calculate based on columnRatio
    const ratio = data.columnRatio || '1-1'
    const contentWidth = totalWidth - gap // Available for actual content

    if (ratio === '1-1') {
      // 50/50 split - each column gets equal content width
      const colWidth = Math.floor(contentWidth / 2)
      columnWidths = [colWidth + gap, colWidth] // First column includes gap
    } else if (ratio === '1-2') {
      // 33/66 split
      const col1 = Math.floor(contentWidth / 3)
      const col2 = Math.floor(contentWidth * 2 / 3)
      columnWidths = [col1 + gap, col2]
    } else if (ratio === '2-1') {
      // 66/33 split
      const col1 = Math.floor(contentWidth * 2 / 3)
      const col2 = Math.floor(contentWidth / 3)
      columnWidths = [col1 + gap, col2]
    }
  } else if (data.columns === 3) {
    // For 3-column layouts, equal split
    const totalGap = gap * 2 // 2 gaps for 3 columns
    const contentWidth = totalWidth - totalGap
    const colWidth = Math.floor(contentWidth / 3)
    columnWidths = [colWidth + gap, colWidth + gap, colWidth]
  } else if (data.columns === 4) {
    // For 4-column layouts, equal split
    const totalGap = gap * 3 // 3 gaps for 4 columns
    const contentWidth = totalWidth - totalGap
    const colWidth = Math.floor(contentWidth / 4)
    columnWidths = [colWidth + gap, colWidth + gap, colWidth + gap, colWidth]
  }

  // Generate HTML for each child block
  const columnsHTML = data.children.map((childBlock, index) => {
    const isLastColumn = index === data.children.length - 1
    const paddingRight = !isLastColumn && data.columns > 1 ? gap : 0
    const columnWidth = columnWidths[index] || columnWidths[0]

    // Only add mobile-full-width class if stackOnMobile is true (default)
    const mobileClass = data.stackOnMobile !== false ? 'mobile-full-width' : ''

    return `<td ${mobileClass ? `class="${mobileClass}"` : ''} width="${columnWidth}" valign="top" style="width: ${columnWidth}px;${paddingRight > 0 ? ` padding-right: ${paddingRight}px;` : ''}">
      ${generateBlockHTML(childBlock)}
    </td>`
  }).join('\n')

  // Add reverse stack class if enabled
  const reverseClass = data.reverseStackOnMobile ? ' mobile-reverse-stack' : ''

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td class="mobile-padding${reverseClass}" style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          ${columnsHTML}
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// Social media icon URLs (using hosted PNG images for email client compatibility)
// Note: Inline SVG is not supported in most email clients (Gmail, Outlook, etc.)
// Using Simple Icons CDN with gray color (#6B7280) for consistent styling
const SOCIAL_ICON_URLS: Record<string, string> = {
  facebook: 'https://img.icons8.com/ios-filled/50/6B7280/facebook-new.png',
  x: 'https://img.icons8.com/ios-filled/50/6B7280/twitterx--v1.png',
  instagram: 'https://img.icons8.com/ios-filled/50/6B7280/instagram-new.png',
  linkedin: 'https://img.icons8.com/ios-filled/50/6B7280/linkedin.png',
  youtube: 'https://img.icons8.com/ios-filled/50/6B7280/youtube-play.png',
  tiktok: 'https://img.icons8.com/ios-filled/50/6B7280/tiktok.png',
  // Legacy support for old "twitter" key - redirects to "x"
  twitter: 'https://img.icons8.com/ios-filled/50/6B7280/twitterx--v1.png',
}

// Generate HTML for a footer block
function generateFooterHTML(block: EmailBlock): string {
  const data = block.data as FooterBlockData
  const { styles } = block

  const textColor = data.textColor || '#6B7280'
  const linkColor = data.linkColor || '#3B82F6'
  const bgColor = data.backgroundColor || '#F3F4F6'
  const fontSize = data.fontSize || '14px'

  let footerContent = ''

  // Company Info Section
  if (data.companyName || data.address) {
    footerContent += `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: 24px;">
      ${data.companyName ? `<div style="font-weight: 600; font-size: 16px; color: ${textColor}; margin-bottom: 8px;">${data.companyName}</div>` : ''}
      ${data.address ? `<div style="font-size: ${fontSize}; color: ${textColor}; line-height: 1.5;">${data.address}</div>` : ''}
    </td>
  </tr>
</table>`
  }

  // Social Icons Section (NON-STACKING on mobile)
  if (data.socialLinks.length > 0) {
    const iconsHTML = data.socialLinks.map((social) => {
      // Use img tags for all icons (email-safe)
      // For custom icons, use provided URL. For platform icons, use CDN URLs
      const iconUrl = social.platform === 'custom' && social.iconUrl
        ? social.iconUrl
        : (SOCIAL_ICON_URLS[social.platform] || SOCIAL_ICON_URLS['facebook']) // Fallback to facebook icon

      const platformName = social.platform === 'x' || social.platform === 'twitter' ? 'X' :
                           social.platform.charAt(0).toUpperCase() + social.platform.slice(1)

      const iconHTML = `<img src="${iconUrl}" alt="${platformName}" width="32" height="32" style="display: block; border: 0;" />`

      return `<td align="center" width="${Math.floor(100 / data.socialLinks.length)}%" style="padding: 0 8px;">
        <a href="${social.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block;">
          ${iconHTML}
        </a>
      </td>`
    }).join('\n')

    footerContent += `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
        <tr>
          ${iconsHTML}
        </tr>
      </table>
    </td>
  </tr>
</table>`
  }

  // Footer Links Section
  if (data.links.length > 0) {
    const linksHTML = data.links.map((link, index) =>
      `<a href="${link.url}" style="color: ${linkColor}; text-decoration: none;">${link.text}</a>${index < data.links.length - 1 ? ' <span style="color: ' + textColor + ';">|</span> ' : ''}`
    ).join('')

    footerContent += `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="font-size: ${fontSize}; color: ${textColor}; padding-bottom: 20px;">
      ${linksHTML}
    </td>
  </tr>
</table>`
  }

  // Legal Text Section
  if (data.legalText) {
    footerContent += `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="font-size: 12px; color: ${textColor}; opacity: 0.8; line-height: 1.5;">
      ${data.legalText}
    </td>
  </tr>
</table>`
  }

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="${getPaddingStyle(styles.padding)} background-color: ${bgColor};">
      ${footerContent || `<div style="text-align: center; padding: 40px 20px; color: #9CA3AF; font-size: 14px;">Footer content goes here</div>`}
    </td>
  </tr>
</table>`
}

// Main function to generate HTML for a single block
function generateBlockHTML(block: EmailBlock): string {
  switch (block.type) {
    case 'heading':
      return generateHeadingHTML(block)
    case 'text':
      return generateTextHTML(block)
    case 'image':
      return generateImageHTML(block)
    case 'imageGallery':
      return generateGalleryHTML(block)
    case 'button':
      return generateButtonHTML(block)
    case 'spacer':
      return generateSpacerHTML(block)
    case 'divider':
      return generateDividerHTML(block)
    case 'layout':
      return generateLayoutHTML(block)
    case 'footer':
      return generateFooterHTML(block)
    default:
      return `<!-- Unknown block type: ${block.type} -->`
  }
}

// Generate complete email HTML document
export function generateEmailHTML(email: EmailDocument, includeOutlookFallback: boolean = true): string {
  const { settings, blocks, title } = email

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  // Generate HTML for all blocks
  const blocksHTML = sortedBlocks.map(generateBlockHTML).join('\n')

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    /* Desktop visibility control */
    .desktop-hide {
      display: none !important;
    }

    /* Responsive styles */
    @media only screen and (max-width: 639px) {
      /* Stacking columns - full width */
      .mobile-full-width {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding-right: 0 !important;
        padding-bottom: 10px !important;
      }

      /* Reverse column order when stacking on mobile */
      .mobile-reverse-stack {
        display: flex !important;
        flex-direction: column-reverse !important;
      }

      /* Non-stacking columns - equal width side-by-side */
      /* Target table cells that don't have mobile-full-width class */
      table[role="presentation"] tr > td[width]:not(.mobile-full-width) {
        width: auto !important;
        min-width: 0 !important;
      }

      .mobile-hide {
        display: none !important;
      }
      .desktop-hide {
        display: block !important;
        visibility: visible !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
      table[role="presentation"] {
        width: 100% !important;
      }
      /* Main email container should be full width on mobile */
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      /* Prevent content overflow in narrow viewports */
      body {
        width: 100% !important;
        min-width: 100% !important;
      }

      /* Responsive Typography - Scale down large headings on mobile */
      h1 {
        font-size: 32px !important;
        line-height: 1.2 !important;
      }
      h2 {
        font-size: 28px !important;
        line-height: 1.3 !important;
      }
      h3 {
        font-size: 24px !important;
        line-height: 1.3 !important;
      }
      h4 {
        font-size: 20px !important;
        line-height: 1.4 !important;
      }
      h5, h6 {
        font-size: 18px !important;
        line-height: 1.4 !important;
      }
      /* Body text stays at default size - don't scale down */
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${settings.backgroundColor};">
  <!-- Preheader text (hidden but shows in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${email.metadata.preheader || ''}
  </div>

  <!-- Hybrid container: Modern clients get centered table, Outlook gets fixed-width wrapper -->
  ${includeOutlookFallback ? `
  <!--[if mso]>
  <!-- Outlook: Fixed-width wrapper table -->
  <table role="presentation" width="${settings.contentWidth}" cellspacing="0" cellpadding="0" border="0" align="center" style="width: ${settings.contentWidth}px;">
    <tr>
      <td style="background-color: #ffffff;">
        ${blocksHTML}
      </td>
    </tr>
  </table>
  <![endif]-->

  <!--[if !mso]><!-->` : ''}
  <!-- Modern clients (Gmail, Apple Mail): Centered table with max-width -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: ${settings.contentWidth}px; background-color: #ffffff;">
          <tr>
            <td style="padding: 0;">
              ${blocksHTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  ${includeOutlookFallback ? `<!--<![endif]-->` : ''}
</body>
</html>`
}

// Helper to generate a downloadable HTML file
export function downloadEmailHTML(email: EmailDocument): void {
  const html = generateEmailHTML(email)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${email.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
