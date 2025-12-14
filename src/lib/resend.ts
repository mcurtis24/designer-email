/**
 * Resend Email Delivery
 * Sends test emails using Resend API
 */

import { config, isResendConfigured } from './config'
import type { EmailDocument } from '@/types/email'
import { generateEmailHTML } from './htmlGenerator'

export interface SendTestEmailParams {
  to: string
  subject: string
  email: EmailDocument
}

/**
 * Send test email via Resend (through backend server)
 */
export async function sendTestEmail({ to, subject, email }: SendTestEmailParams): Promise<void> {
  if (!isResendConfigured()) {
    throw new Error('Resend is not configured. Please set VITE_RESEND_API_KEY and VITE_RESEND_FROM_EMAIL in your .env file.')
  }

  const htmlContent = generateEmailHTML(email, false)

  try {
    // Call our backend server instead of Resend directly (avoids CORS)
    const response = await fetch('http://localhost:3002/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to send email: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Test email sent successfully:', data)
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
