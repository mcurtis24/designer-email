/**
 * Version Manager - Auto-snapshots and Manual Saves
 * Manages email version history with auto and manual snapshots
 */

import { nanoid } from 'nanoid'
import type { EmailBlock, EmailVersion } from '@/types/email'

export interface VersionConfig {
  maxAutoVersions: number
  maxManualVersions: number
  autoVersionInterval: number // milliseconds
  pruneOnExceed: boolean
}

export const DEFAULT_VERSION_CONFIG: VersionConfig = {
  maxAutoVersions: 10,
  maxManualVersions: 25,
  autoVersionInterval: 120000, // 2 minutes
  pruneOnExceed: true,
}

/**
 * Version Manager for creating, pruning, and managing email versions
 */
export class VersionManager {
  private config: VersionConfig

  constructor(config?: Partial<VersionConfig>) {
    this.config = {
      ...DEFAULT_VERSION_CONFIG,
      ...config,
    }
  }

  /**
   * Create a new version snapshot
   */
  createVersion(
    blocks: EmailBlock[],
    type: 'auto' | 'manual' | 'checkpoint',
    message?: string
  ): EmailVersion {
    return {
      id: nanoid(),
      timestamp: new Date(),
      blocks: JSON.parse(JSON.stringify(blocks)), // Deep clone to prevent mutations
      message: message || (type === 'auto' ? 'Auto-save' : undefined),
      type,
    }
  }

  /**
   * Prune old versions to stay within limits
   * Keeps the most recent versions of each type
   */
  pruneVersions(versions: EmailVersion[]): EmailVersion[] {
    // Separate by type
    const autoVersions = versions
      .filter((v) => v.type === 'auto')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, this.config.maxAutoVersions)

    const manualVersions = versions
      .filter((v) => v.type === 'manual' || v.type === 'checkpoint')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, this.config.maxManualVersions)

    // Combine and sort by timestamp (most recent first)
    return [...autoVersions, ...manualVersions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  /**
   * Check if enough time has passed to create an auto-version
   */
  shouldCreateAutoVersion(lastVersionTime: Date | null): boolean {
    if (!lastVersionTime) return true

    const now = Date.now()
    const lastTime = new Date(lastVersionTime).getTime()
    return now - lastTime >= this.config.autoVersionInterval
  }

  /**
   * Get the last auto-version timestamp from a version list
   */
  getLastAutoVersionTime(versions: EmailVersion[]): Date | null {
    const autoVersions = versions
      .filter((v) => v.type === 'auto')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return autoVersions.length > 0 ? new Date(autoVersions[0].timestamp) : null
  }

  /**
   * Get version statistics
   */
  getStats(versions: EmailVersion[]): {
    total: number
    auto: number
    manual: number
    oldest: Date | null
    newest: Date | null
  } {
    const autoCount = versions.filter((v) => v.type === 'auto').length
    const manualCount = versions.filter((v) => v.type === 'manual' || v.type === 'checkpoint').length

    const timestamps = versions.map((v) => new Date(v.timestamp).getTime())
    const oldest = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null
    const newest = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null

    return {
      total: versions.length,
      auto: autoCount,
      manual: manualCount,
      oldest,
      newest,
    }
  }

  /**
   * Format version timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    // Less than 1 minute ago
    if (diffMins < 1) {
      return 'Just now'
    }

    // Less than 1 hour ago
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
    }

    // Less than 24 hours ago
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    }

    // Less than 7 days ago
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  /**
   * Format version timestamp as full datetime
   */
  formatFullTimestamp(timestamp: Date): string {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  /**
   * Calculate size of blocks in KB (approximate)
   */
  calculateSize(blocks: EmailBlock[]): number {
    const json = JSON.stringify(blocks)
    return Math.round((json.length * 2) / 1024) // UTF-16 chars = 2 bytes each
  }

  /**
   * Get configuration
   */
  getConfig(): VersionConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VersionConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    }
  }
}
