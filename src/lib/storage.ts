/**
 * LocalStorage Persistence
 * Auto-save and load email state from localStorage
 */

import type { EmailDocument } from '@/types/email'

const STORAGE_KEY = 'email-editor-state'
const AUTO_SAVE_INTERVAL = 3000 // Auto-save every 3 seconds

/**
 * Save email to localStorage
 */
export function saveEmailToStorage(email: EmailDocument): void {
  try {
    const serialized = JSON.stringify({
      ...email,
      createdAt: email.createdAt.toISOString(),
      updatedAt: email.updatedAt.toISOString(),
      history: email.history.map(v => ({
        ...v,
        timestamp: v.timestamp instanceof Date ? v.timestamp.toISOString() : v.timestamp,
      })),
    })
    localStorage.setItem(STORAGE_KEY, serialized)
    console.log('Email auto-saved to localStorage')
  } catch (error) {
    console.error('Failed to save email to localStorage:', error)
  }
}

/**
 * Load email from localStorage
 */
export function loadEmailFromStorage(): EmailDocument | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null

    const data = JSON.parse(serialized)
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      history: (data.history || []).map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp),
      })),
    }
  } catch (error) {
    console.error('Failed to load email from localStorage:', error)
    return null
  }
}

/**
 * Clear email from localStorage
 */
export function clearEmailStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Email cleared from localStorage')
  } catch (error) {
    console.error('Failed to clear email from localStorage:', error)
  }
}

/**
 * Export email as JSON file
 */
export function exportEmailJSON(email: EmailDocument): void {
  try {
    const json = JSON.stringify(email, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${email.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('Email exported as JSON')
  } catch (error) {
    console.error('Failed to export email as JSON:', error)
  }
}

/**
 * Import email from JSON file
 */
export function importEmailJSON(file: File): Promise<EmailDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        const email: EmailDocument = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        }

        resolve(email)
      } catch (error) {
        reject(new Error('Invalid email JSON file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Get auto-save interval
 */
export function getAutoSaveInterval(): number {
  return AUTO_SAVE_INTERVAL
}
