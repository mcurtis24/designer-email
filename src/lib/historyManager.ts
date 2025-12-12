/**
 * History Manager - Circular Buffer for Undo/Redo
 * Provides memory-efficient history management with configurable limits
 */

import type { EmailBlock } from '@/types/email'

/**
 * Circular buffer implementation for efficient history storage
 * Automatically overwrites oldest entries when max size is reached
 */
export class CircularHistoryBuffer<T = EmailBlock[]> {
  private buffer: T[]
  private maxSize: number
  private currentIndex: number // Current position in history
  private size: number // Number of items in buffer

  constructor(maxSize: number = 50) {
    this.buffer = []
    this.maxSize = maxSize
    this.currentIndex = -1 // Start at -1, first push will make it 0
    this.size = 0
  }

  /**
   * Add a new state to history
   * Clears any redo history when adding after undo
   */
  push(state: T): void {
    // When pushing a new state, clear any redo history
    // (remove everything after currentIndex)
    if (this.currentIndex < this.size - 1) {
      this.buffer = this.buffer.slice(0, this.currentIndex + 1)
      this.size = this.currentIndex + 1
    }

    // Add new state
    if (this.size < this.maxSize) {
      // Buffer not full yet, just append
      this.buffer.push(state)
      this.size++
      this.currentIndex++
    } else {
      // Buffer full, remove oldest and append
      this.buffer.shift()
      this.buffer.push(state)
      // currentIndex stays at maxSize - 1
      this.currentIndex = this.maxSize - 1
    }
  }

  /**
   * Get current state
   */
  getCurrent(): T | undefined {
    if (this.currentIndex < 0 || this.currentIndex >= this.size) {
      return undefined
    }
    return this.buffer[this.currentIndex]
  }

  /**
   * Move back in history (undo)
   * Returns the previous state or undefined if at the beginning
   */
  undo(): T | undefined {
    if (this.currentIndex <= 0) {
      return undefined
    }
    this.currentIndex--
    return this.buffer[this.currentIndex]
  }

  /**
   * Move forward in history (redo)
   * Returns the next state or undefined if at the end
   */
  redo(): T | undefined {
    if (this.currentIndex >= this.size - 1) {
      return undefined
    }
    this.currentIndex++
    return this.buffer[this.currentIndex]
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.size - 1
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.buffer = []
    this.currentIndex = -1
    this.size = 0
  }

  /**
   * Get current position in history
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * Get total number of states in buffer
   */
  getSize(): number {
    return this.size
  }

  /**
   * Get max buffer size
   */
  getMaxSize(): number {
    return this.maxSize
  }

  /**
   * Initialize buffer with existing history array
   * Used for migration from old history system
   */
  initializeFromArray(history: T[], currentIndex: number): void {
    this.clear()

    // If history is larger than maxSize, only keep the most recent entries
    const startIndex = Math.max(0, history.length - this.maxSize)
    const trimmedHistory = history.slice(startIndex)

    this.buffer = [...trimmedHistory]
    this.size = trimmedHistory.length

    // Adjust currentIndex relative to trimmed history
    const adjustedIndex = currentIndex - startIndex
    this.currentIndex = Math.max(0, Math.min(adjustedIndex, this.size - 1))
  }

  /**
   * Export to array format (for persistence)
   * Returns current buffer state and index
   */
  toArray(): { history: T[], currentIndex: number } {
    return {
      history: [...this.buffer],
      currentIndex: this.currentIndex
    }
  }
}

/**
 * Action batching manager for grouping rapid changes
 * Prevents undo history explosion from typing
 */
export class ActionBatcher {
  private batchTimer: ReturnType<typeof setTimeout> | null = null
  private pendingState: EmailBlock[] | null = null
  private batchDelay: number
  private onBatchComplete: (state: EmailBlock[]) => void

  constructor(onBatchComplete: (state: EmailBlock[]) => void, batchDelay: number = 500) {
    this.onBatchComplete = onBatchComplete
    this.batchDelay = batchDelay
  }

  /**
   * Queue a state change for batching
   * Will be committed after batchDelay ms of inactivity
   */
  queueChange(state: EmailBlock[]): void {
    this.pendingState = state

    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    // Set new timer
    this.batchTimer = setTimeout(() => {
      this.flush()
    }, this.batchDelay)
  }

  /**
   * Immediately commit any pending changes
   */
  flush(): void {
    if (this.pendingState) {
      this.onBatchComplete(this.pendingState)
      this.pendingState = null
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
  }

  /**
   * Check if there are pending changes
   */
  hasPending(): boolean {
    return this.pendingState !== null
  }

  /**
   * Cleanup timers
   */
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    this.pendingState = null
  }
}
