/**
 * Auto-Save Hook
 * Automatically saves email state to localStorage and creates version snapshots
 */

import { useEffect, useRef } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { saveEmailToStorage, loadEmailFromStorage, getAutoSaveInterval } from '@/lib/storage'

export function useAutoSave() {
  const email = useEmailStore((state) => state.email)
  const isDirty = useEmailStore((state) => state.editorState.isDirty)
  const markAsSaved = useEmailStore((state) => state.markAsSaved)
  const loadEmail = useEmailStore((state) => state.loadEmail)
  const createVersion = useEmailStore((state) => state.createVersion)
  const versionManager = useEmailStore((state) => state.versionManager)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const versionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)

  // Load email from localStorage on mount
  useEffect(() => {
    const savedEmail = loadEmailFromStorage()
    if (savedEmail) {
      loadEmail(savedEmail)
      console.log('Email loaded from localStorage')
    }
  }, [loadEmail])

  // Auto-save when email changes
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only save if there are changes
    if (!isDirty) return

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set new timer for auto-save
    timerRef.current = setTimeout(() => {
      saveEmailToStorage(email)
      markAsSaved()

      // Check if we should create an auto-version (every 5 minutes)
      const lastAutoVersionTime = versionManager.getLastAutoVersionTime(email.history)
      if (versionManager.shouldCreateAutoVersion(lastAutoVersionTime)) {
        createVersion('auto', 'Auto-save snapshot')
        console.log('Auto-version created')
      }
    }, getAutoSaveInterval())

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [email, isDirty, markAsSaved, createVersion, versionManager])

  // Periodic version check (every minute) - creates version if 5 minutes have passed
  useEffect(() => {
    // Check every minute if we need to create a version
    versionTimerRef.current = setInterval(() => {
      const lastAutoVersionTime = versionManager.getLastAutoVersionTime(email.history)
      if (versionManager.shouldCreateAutoVersion(lastAutoVersionTime)) {
        // Only create if there are blocks (not empty email)
        if (email.blocks.length > 0) {
          createVersion('auto', 'Auto-save snapshot')
          console.log('Periodic auto-version created')
        }
      }
    }, 60000) // Check every minute

    return () => {
      if (versionTimerRef.current) {
        clearInterval(versionTimerRef.current)
      }
    }
  }, [email.blocks.length, email.history, createVersion, versionManager])

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        saveEmailToStorage(email)

        // Show confirmation dialog if there are unsaved changes
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [email, isDirty])
}
