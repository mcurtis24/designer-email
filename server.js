/**
 * Simple Express server for handling Resend email API calls
 * This avoids CORS issues by calling Resend from the backend
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Resend } from 'resend'

// Load environment variables
dotenv.config()

const app = express()
const PORT = 3002

// Initialize Resend
const apiKey = process.env.VITE_RESEND_API_KEY
const resend = new Resend(apiKey)

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email server is running' })
})

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body

  // Validate required fields
  if (!to || !subject || !html) {
    return res.status(400).json({
      error: 'Missing required fields: to, subject, html'
    })
  }

  // Validate Resend configuration
  if (!apiKey) {
    return res.status(500).json({
      error: 'Resend not configured. Please set VITE_RESEND_API_KEY in .env'
    })
  }

  try {
    // Send email using Resend SDK
    // Using onboarding@resend.dev (no verification needed for testing)
    const { data, error } = await resend.emails.send({
      from: 'Designer Email <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      return res.status(400).json({
        error: error.message || 'Failed to send email',
        details: error
      })
    }

    console.log('✅ Email sent successfully:', data.id)

    res.json({
      success: true,
      id: data.id,
      message: 'Email sent successfully'
    })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({
      error: error.message || 'Failed to send email'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Email server running on http://localhost:${PORT}`)
  console.log(`📧 Resend configured: ${process.env.VITE_RESEND_FROM_EMAIL}`)
  console.log(`\nEndpoints:`)
  console.log(`  GET  http://localhost:${PORT}/api/health`)
  console.log(`  POST http://localhost:${PORT}/api/send-email\n`)
})
