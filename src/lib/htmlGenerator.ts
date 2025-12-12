/**
 * HTML Generation Engine
 * Converts email blocks to email-safe HTML (640px, table-based, inline styles)
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
} from '@/types/email'

// Helper to generate inline padding style
function getPaddingStyle(padding?: any): string {
  if (!padding) return ''
  return `padding: ${padding.top} ${padding.right} ${padding.bottom} ${padding.left};`
}

// Generate HTML for a heading block
function generateHeadingHTML(block: EmailBlock): string {
  const data = block.data as HeadingBlockData
  const { styles } = block

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
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

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
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

  // Calculate percentage width for each column
  const columnWidthPercent = Math.floor(100 / columns)

  // Chunk images into rows
  const rows: typeof validImages[] = []
  for (let i = 0; i < validImages.length; i += columns) {
    rows.push(validImages.slice(i, i + columns))
  }

  // Calculate fixed image height based on column count for consistent aspect ratio
  // 2-col: 280px, 3-col: 180px, 4-col: 140px
  const imageHeight = columns === 2 ? 280 : columns === 3 ? 180 : 140

  // Generate HTML for each row
  const rowsHTML = rows.map((rowImages, rowIndex) => {
    const isLastRow = rowIndex === rows.length - 1
    const cellsHTML = rowImages.map((image, cellIndex) => {
      const isLastInRow = cellIndex === rowImages.length - 1
      const borderRadiusStyle = (image as any).borderRadius ? `border-radius: ${(image as any).borderRadius}px;` : ''
      const objectPosition = image.objectPosition || '50% 50%'

      // HYBRID APPROACH for gallery images:
      // - Modern clients: Use object-fit: cover for perfect cropping with focal point control
      // - Outlook: Use simple img tag (may stretch/distort, but displays correctly)
      // Trade-off: Gmail users get pixel-perfect design, Outlook users see functional images
      const modernImageTag = `<img src="${image.src}" alt="${image.alt}" style="display: block; width: 100%; height: ${imageHeight}px; object-fit: cover; object-position: ${objectPosition}; border: 0; ${borderRadiusStyle}" />`
      const outlookImageTag = `<img src="${image.src}" alt="${image.alt}" width="100%" height="${imageHeight}" style="display: block; border: 0; ${borderRadiusStyle}" />`

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

      return `<td align="center" valign="top" width="${columnWidthPercent}%" style="${isLastInRow ? '' : `padding-right: ${gap}px;`}">
        ${content}
      </td>`
    }).join('\n')

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

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="height: ${data.height}px; line-height: ${data.height}px; font-size: 0;">
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
  const totalWidth = 640

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

    return `<td class="mobile-full-width" width="${columnWidth}" valign="top" style="width: ${columnWidth}px;${paddingRight > 0 ? ` padding-right: ${paddingRight}px;` : ''}">
      ${generateBlockHTML(childBlock)}
    </td>`
  }).join('\n')

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td class="mobile-padding" style="${getPaddingStyle(styles.padding)} ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          ${columnsHTML}
        </tr>
      </table>
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

    /* Responsive styles */
    @media only screen and (max-width: 640px) {
      .mobile-full-width {
        width: 100% !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
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
        <table role="presentation" width="${settings.contentWidth}" cellspacing="0" cellpadding="0" border="0" style="max-width: ${settings.contentWidth}px; background-color: #ffffff;">
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
