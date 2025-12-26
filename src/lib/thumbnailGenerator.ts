import html2canvas from 'html2canvas'
import { EmailDocument } from '@/types/email'
import { generateEmailHTML } from './htmlGenerator'

/**
 * Generates a thumbnail image (Base64 PNG) from an email document
 * Uses html2canvas to render the email HTML and capture as image
 *
 * @param email - The email document to generate thumbnail for
 * @param options - Configuration options for thumbnail generation
 * @returns Promise<string> - Base64 PNG data URL
 */
export async function generateThumbnail(
  email: EmailDocument,
  options: {
    width?: number
    quality?: number
    scale?: number
  } = {}
): Promise<string> {
  const {
    width = 320, // Default thumbnail width
    quality = 0.7, // PNG compression quality (0-1)
    scale = 0.5, // Scale factor for rendering
  } = options

  try {
    // Generate email HTML (without Outlook fallback for cleaner thumbnail)
    const htmlContent = generateEmailHTML(email, false)

    // Create temporary container for rendering
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = `${email.settings.contentWidth}px`
    container.style.visibility = 'hidden'
    container.innerHTML = htmlContent

    // Append to body for rendering
    document.body.appendChild(container)

    // Wait for images to load
    await waitForImages(container)

    // Capture canvas with html2canvas
    const canvas = await html2canvas(container, {
      scale,
      backgroundColor: email.settings.backgroundColor,
      logging: false,
      allowTaint: true,
      useCORS: true,
      width: email.settings.contentWidth,
    })

    // Remove temporary container
    document.body.removeChild(container)

    // Calculate height maintaining aspect ratio
    const aspectRatio = canvas.height / canvas.width
    const height = Math.round(width * aspectRatio)

    // Create final canvas with desired dimensions
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = width
    finalCanvas.height = height

    const ctx = finalCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Draw scaled image
    ctx.drawImage(canvas, 0, 0, width, height)

    // Convert to Base64 PNG
    const dataUrl = finalCanvas.toDataURL('image/png', quality)

    return dataUrl
  } catch (error) {
    console.error('Failed to generate thumbnail:', error)

    // Return placeholder SVG on error
    return generatePlaceholderThumbnail(email)
  }
}

/**
 * Waits for all images in a container to load
 * @param container - DOM element containing images
 */
function waitForImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img')

  if (images.length === 0) {
    return Promise.resolve()
  }

  const promises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve() // Resolve even on error to not block

      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000)
    })
  })

  return Promise.all(promises).then(() => {})
}

/**
 * Generates a placeholder SVG thumbnail when html2canvas fails
 * @param email - Email document for metadata
 * @returns Base64 SVG data URL
 */
function generatePlaceholderThumbnail(email: EmailDocument): string {
  const blockCount = email.blocks.length

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
      <rect width="320" height="240" fill="${email.settings.backgroundColor || '#f4f4f4'}"/>
      <rect x="20" y="20" width="280" height="200" fill="white" rx="8"/>

      <!-- Email icon -->
      <g transform="translate(160, 80)">
        <rect x="-30" y="-20" width="60" height="40" fill="#e5e7eb" rx="4"/>
        <path d="M -30 -20 L 0 5 L 30 -20" stroke="#9ca3af" stroke-width="2" fill="none"/>
      </g>

      <!-- Info text -->
      <text x="160" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${blockCount} block${blockCount !== 1 ? 's' : ''}
      </text>
      <text x="160" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">
        Thumbnail unavailable
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Estimates thumbnail file size in KB
 * @param dataUrl - Base64 data URL
 * @returns Estimated size in KB
 */
export function estimateThumbnailSize(dataUrl: string): number {
  // Base64 adds ~33% overhead, so actual size = (length * 0.75) / 1024
  return Math.round((dataUrl.length * 0.75) / 1024)
}

/**
 * Validates thumbnail data URL
 * @param dataUrl - Base64 data URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidThumbnail(dataUrl: string): boolean {
  return (
    typeof dataUrl === 'string' &&
    (dataUrl.startsWith('data:image/png;base64,') ||
      dataUrl.startsWith('data:image/svg+xml;base64,'))
  )
}
