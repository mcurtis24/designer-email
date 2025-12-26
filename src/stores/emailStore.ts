/**
 * Email Store - Zustand State Management
 * Manages email document state, blocks, and editor state
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  EmailDocument,
  EmailBlock,
  EmailSettings,
  EmailVersion,
  EditorState,
  ViewportState,
  BrandColor,
  TypographyStyle,
} from '@/types/email'
import { CircularHistoryBuffer, ActionBatcher } from '@/lib/historyManager'
import { VersionManager } from '@/lib/versionManager'
import { validateTemplate } from '@/lib/templateValidator'
import { stripToPlaceholders } from '@/lib/templatePlaceholders'
import { getTemplateMetadata } from '@/lib/templates'

interface EmailStore {
  // Email Document State
  email: EmailDocument

  // Editor UI State
  editorState: EditorState

  // Sidebar UI State
  activeSidebarTab: 'content' | 'blocks' | 'style' | 'templates' | 'assets' | 'branding'
  autoOpenColorPicker: boolean

  // History for Undo/Redo (using circular buffer for memory efficiency)
  historyBuffer: CircularHistoryBuffer<EmailBlock[]>
  actionBatcher: ActionBatcher
  versionManager: VersionManager

  // Actions - Email Management
  setEmailTitle: (title: string) => void
  setEmailSettings: (settings: Partial<EmailSettings>) => void

  // Actions - Block Management
  addBlock: (block: EmailBlock) => void
  addBlockAtIndex: (block: EmailBlock, index: number) => void
  updateBlock: (blockId: string, updates: Partial<EmailBlock>, options?: { batch?: boolean }) => void
  flushBatchedChanges: () => void
  deleteBlock: (blockId: string) => void
  clearAllBlocks: () => void
  reorderBlocks: (sourceIndex: number, destinationIndex: number) => void
  duplicateBlock: (blockId: string) => void
  moveBlockUp: (blockId: string) => void
  moveBlockDown: (blockId: string) => void
  addBlockToLayoutColumn: (layoutBlockId: string, columnIndex: number, block: EmailBlock) => void

  // Actions - Selection
  selectBlock: (blockId: string | null) => void
  getSelectedBlock: () => EmailBlock | null

  // Actions - Editing (for top toolbar)
  setEditingBlock: (blockId: string | null, type: 'text' | 'heading' | null) => void
  clearEditingBlock: () => void

  // Actions - Gallery
  setSelectedGalleryImageIndex: (index: number) => void

  // Actions - Sidebar
  setActiveSidebarTab: (tab: 'content' | 'blocks' | 'style' | 'templates' | 'assets' | 'branding') => void
  setAutoOpenColorPicker: (value: boolean) => void

  // Actions - Viewport
  setViewportMode: (mode: ViewportState['mode']) => void
  setZoom: (zoom: number) => void

  // Actions - Brand Colors
  addBrandColor: (color: string, name?: string) => void
  removeBrandColor: (color: string) => void
  updateBrandColorName: (color: string, name: string) => void
  reorderBrandColors: (colors: BrandColor[]) => void

  // Actions - Typography Styles
  updateTypographyStyle: (styleName: 'heading' | 'body', updates: Partial<TypographyStyle>) => void
  applyTypographyStyleToAll: (styleName: 'heading' | 'body') => void
  resetTypographyStyles: () => void

  // Actions - History (Undo/Redo)
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Actions - Save/Load
  markAsSaved: () => void
  markAsDirty: () => void
  loadEmail: (email: EmailDocument) => void
  createNewEmail: () => void
  loadTemplate: (template: any) => void // Template with blocks and settings

  // Actions - Version Management
  createVersion: (type: 'auto' | 'manual' | 'checkpoint', message?: string) => EmailVersion
  restoreVersion: (versionId: string) => void
  pruneVersions: () => void
  getVersions: () => EmailVersion[]
  deleteVersion: (versionId: string) => void
}

// Helper to create a new empty email document
function createNewEmail(): EmailDocument {
  return {
    id: nanoid(),
    title: 'Untitled Email',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    metadata: {},
    settings: {
      backgroundColor: '#f4f4f4',
      contentWidth: 640,
      fontFamily: 'Arial, Helvetica, sans-serif',
      textColor: '#333333',
      brandColors: [],
      typographyStyles: [
        {
          name: 'heading',
          fontFamily: 'Georgia, serif',
          fontSize: '32px',
          mobileFontSize: '24px',
          fontWeight: 700,
          color: '#1F2937',
          lineHeight: 1.2,
        },
        {
          name: 'body',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          mobileFontSize: '16px',
          fontWeight: 400,
          color: '#374151',
          lineHeight: 1.6,
        },
      ],
    },
    blocks: [],
    history: [],
  }
}

// Create action batcher outside the store to persist across store updates
const createActionBatcher = (get: () => EmailStore) => {
  return new ActionBatcher((blocks: EmailBlock[]) => {
    const state = get()
    state.historyBuffer.push(blocks)
  }, 500) // 500ms delay for batching
}

let actionBatcherInstance: ActionBatcher | null = null

export const useEmailStore = create<EmailStore>((set, get) => ({
    // Initial State
    email: createNewEmail(),

    editorState: {
      selectedBlockId: null,
      editingBlockId: null,
      editingType: null,
      draggedBlockId: null,
      selectedGalleryImageIndex: 0,
      viewport: {
        mode: 'mobile', // Mobile-first!
        zoom: 120,
      },
      isDirty: false,
      isSaving: false,
      lastSaved: null,
    },

    activeSidebarTab: 'content',
    autoOpenColorPicker: false,

    historyBuffer: new CircularHistoryBuffer<EmailBlock[]>(50),
    actionBatcher: actionBatcherInstance || (actionBatcherInstance = createActionBatcher(get)),
    versionManager: new VersionManager(),

  // Email Management Actions
  setEmailTitle: (title) =>
    set((state) => ({
      email: { ...state.email, title, updatedAt: new Date() },
      editorState: { ...state.editorState, isDirty: true },
    })),

  setEmailSettings: (settings) =>
    set((state) => ({
      email: {
        ...state.email,
        settings: { ...state.email.settings, ...settings },
        updatedAt: new Date(),
      },
      editorState: { ...state.editorState, isDirty: true },
    })),

  // Block Management Actions
  addBlock: (block) =>
    set((state) => {
      const newBlocks = [...state.email.blocks, block]
      state.historyBuffer.push(newBlocks)

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  addBlockAtIndex: (block, index) =>
    set((state) => {
      const newBlocks = [...state.email.blocks]
      newBlocks.splice(index, 0, block) // Insert at index

      // Recalculate order for all blocks
      newBlocks.forEach((b, i) => {
        b.order = i
      })

      state.historyBuffer.push(newBlocks)

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: {
          ...state.editorState,
          isDirty: true,
          selectedBlockId: block.id, // Auto-select new block
        },
      }
    }),

  updateBlock: (blockId, updates, options) =>
    set((state) => {
      // Helper function to recursively update blocks including nested ones
      const updateBlockRecursive = (block: EmailBlock): EmailBlock => {
        // If this is the block we're looking for, update it
        if (block.id === blockId) {
          return { ...block, ...updates }
        }

        // If this is a layout block, recursively update its children
        if (block.type === 'layout') {
          const layoutData = block.data as any
          const updatedChildren = layoutData.children.map(updateBlockRecursive)

          // Only create new block if children actually changed
          if (updatedChildren.some((child: EmailBlock, i: number) => child !== layoutData.children[i])) {
            return {
              ...block,
              data: {
                ...layoutData,
                children: updatedChildren,
              },
            }
          }
        }

        return block
      }

      const newBlocks = state.email.blocks.map(updateBlockRecursive)

      // If batching is enabled, queue the change instead of immediately pushing to history
      if (options?.batch) {
        state.actionBatcher.queueChange(newBlocks)
      } else {
        // Flush any pending batched changes first
        state.actionBatcher.flush()
        // Then immediately push this change to history
        state.historyBuffer.push(newBlocks)
      }

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  flushBatchedChanges: () => {
    const state = get()
    state.actionBatcher.flush()
  },

  deleteBlock: (blockId) =>
    set((state) => {
      const newBlocks = state.email.blocks.filter((block) => block.id !== blockId)
      state.historyBuffer.push(newBlocks)

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: {
          ...state.editorState,
          isDirty: true,
          selectedBlockId: state.editorState.selectedBlockId === blockId ? null : state.editorState.selectedBlockId,
          editingBlockId: state.editorState.editingBlockId === blockId ? null : state.editorState.editingBlockId,
          editingType: state.editorState.editingBlockId === blockId ? null : state.editorState.editingType,
        },
      }
    }),

  clearAllBlocks: () =>
    set((state) => {
      state.historyBuffer.push([])

      return {
        email: {
          ...state.email,
          blocks: [],
          updatedAt: new Date(),
        },
        editorState: {
          ...state.editorState,
          isDirty: true,
          selectedBlockId: null,
          editingBlockId: null,
          editingType: null,
        },
      }
    }),

  reorderBlocks: (sourceIndex, destinationIndex) =>
    set((state) => {
      const newBlocks = [...state.email.blocks]
      const [removed] = newBlocks.splice(sourceIndex, 1)
      newBlocks.splice(destinationIndex, 0, removed)

      // Update order property on all blocks
      newBlocks.forEach((block, index) => {
        block.order = index
      })

      state.historyBuffer.push(newBlocks)

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  duplicateBlock: (blockId) =>
    set((state) => {
      const blockToDuplicate = state.email.blocks.find((b) => b.id === blockId)
      if (!blockToDuplicate) return state

      const newBlock = {
        ...blockToDuplicate,
        id: nanoid(),
        order: blockToDuplicate.order + 1,
      }

      const newBlocks = [...state.email.blocks]
      newBlocks.splice(blockToDuplicate.order + 1, 0, newBlock)

      // Update order for blocks after the duplicated one
      newBlocks.forEach((block, index) => {
        block.order = index
      })

      state.historyBuffer.push(newBlocks)

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  moveBlockUp: (blockId) => {
    const state = get()
    const blockIndex = state.email.blocks.findIndex((b) => b.id === blockId)
    if (blockIndex > 0) {
      get().reorderBlocks(blockIndex, blockIndex - 1)
    }
  },

  moveBlockDown: (blockId) => {
    const state = get()
    const blockIndex = state.email.blocks.findIndex((b) => b.id === blockId)
    if (blockIndex < state.email.blocks.length - 1) {
      get().reorderBlocks(blockIndex, blockIndex + 1)
    }
  },

  addBlockToLayoutColumn: (layoutBlockId, columnIndex, block) =>
    set((state) => {
      const newBlocks = state.email.blocks.map((b) => {
        if (b.id === layoutBlockId && b.type === 'layout') {
          const layoutData = b.data as any
          const newChildren = [...layoutData.children]
          newChildren[columnIndex] = block

          return {
            ...b,
            data: {
              ...layoutData,
              children: newChildren,
            },
          }
        }
        return b
      })

      state.historyBuffer.push(newBlocks)

      return {
        email: {
          ...state.email,
          blocks: newBlocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  // Selection Actions
  selectBlock: (blockId) =>
    set((state) => ({
      editorState: { ...state.editorState, selectedBlockId: blockId },
    })),

  getSelectedBlock: () => {
    const state = get()
    if (!state.editorState.selectedBlockId) return null
    return state.email.blocks.find((b) => b.id === state.editorState.selectedBlockId) || null
  },

  // Editing Actions
  setEditingBlock: (blockId, type) =>
    set((state) => ({
      editorState: { ...state.editorState, editingBlockId: blockId, editingType: type },
    })),

  clearEditingBlock: () =>
    set((state) => {
      // Flush any batched changes when exiting edit mode
      state.actionBatcher.flush()

      return {
        editorState: { ...state.editorState, editingBlockId: null, editingType: null },
      }
    }),

  // Gallery Actions
  setSelectedGalleryImageIndex: (index) =>
    set((state) => ({
      editorState: { ...state.editorState, selectedGalleryImageIndex: index },
    })),

  // Sidebar Actions
  setActiveSidebarTab: (tab) =>
    set(() => ({
      activeSidebarTab: tab,
    })),

  setAutoOpenColorPicker: (value) =>
    set(() => ({
      autoOpenColorPicker: value,
    })),

  // Viewport Actions
  setViewportMode: (mode) =>
    set((state) => ({
      editorState: {
        ...state.editorState,
        viewport: { ...state.editorState.viewport, mode },
      },
    })),

  setZoom: (zoom) =>
    set((state) => ({
      editorState: {
        ...state.editorState,
        viewport: { ...state.editorState.viewport, zoom },
      },
    })),

  // Brand Colors Actions
  addBrandColor: (color, name) =>
    set((state) => {
      const normalizedColor = color.toUpperCase()
      // Don't add duplicates
      if (state.email.settings.brandColors.some((bc) => bc.color === normalizedColor)) {
        return state
      }

      const newBrandColor: BrandColor = {
        color: normalizedColor,
        name: name || undefined,
        order: state.email.settings.brandColors.length,
      }

      return {
        email: {
          ...state.email,
          settings: {
            ...state.email.settings,
            brandColors: [...state.email.settings.brandColors, newBrandColor],
          },
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  removeBrandColor: (color) =>
    set((state) => ({
      email: {
        ...state.email,
        settings: {
          ...state.email.settings,
          brandColors: state.email.settings.brandColors.filter((bc) => bc.color !== color),
        },
        updatedAt: new Date(),
      },
      editorState: { ...state.editorState, isDirty: true },
    })),

  updateBrandColorName: (color, name) =>
    set((state) => ({
      email: {
        ...state.email,
        settings: {
          ...state.email.settings,
          brandColors: state.email.settings.brandColors.map((bc) =>
            bc.color === color ? { ...bc, name } : bc
          ),
        },
        updatedAt: new Date(),
      },
      editorState: { ...state.editorState, isDirty: true },
    })),

  reorderBrandColors: (colors) =>
    set((state) => ({
      email: {
        ...state.email,
        settings: {
          ...state.email.settings,
          brandColors: colors.map((color, index) => ({ ...color, order: index })),
        },
        updatedAt: new Date(),
      },
      editorState: { ...state.editorState, isDirty: true },
    })),

  // Typography Styles Actions
  updateTypographyStyle: (styleName, updates) =>
    set((state) => {
      const currentStyles = state.email.settings.typographyStyles || []
      const updatedStyles = currentStyles.map((style) =>
        style.name === styleName ? { ...style, ...updates } : style
      )

      return {
        email: {
          ...state.email,
          settings: {
            ...state.email.settings,
            typographyStyles: updatedStyles,
          },
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  applyTypographyStyleToAll: (styleName) =>
    set((state) => {
      const typographyStyles = state.email.settings.typographyStyles || []
      const style = typographyStyles.find((s) => s.name === styleName)

      if (!style) return state

      // Apply style to all relevant blocks
      const updatedBlocks = state.email.blocks.map((block) => {
        if (styleName === 'heading' && block.type === 'heading') {
          return {
            ...block,
            data: {
              ...block.data,
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              color: style.color,
              lineHeight: style.lineHeight,
            },
          }
        } else if (styleName === 'body' && block.type === 'text') {
          return {
            ...block,
            data: {
              ...block.data,
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              color: style.color,
              lineHeight: style.lineHeight,
            },
          }
        }
        return block
      })

      return {
        email: {
          ...state.email,
          blocks: updatedBlocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  resetTypographyStyles: () =>
    set((state) => ({
      email: {
        ...state.email,
        settings: {
          ...state.email.settings,
          typographyStyles: [
            {
              name: 'heading',
              fontFamily: 'Georgia, serif',
              fontSize: '32px',
              mobileFontSize: '24px',
              fontWeight: 700,
              color: '#1F2937',
              lineHeight: 1.2,
            },
            {
              name: 'body',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              color: '#374151',
              lineHeight: 1.6,
            },
          ],
        },
        updatedAt: new Date(),
      },
      editorState: { ...state.editorState, isDirty: true },
    })),

  // History Actions (Undo/Redo)
  undo: () =>
    set((state) => {
      const blocks = state.historyBuffer.undo()
      if (!blocks) return state

      return {
        email: {
          ...state.email,
          blocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  redo: () =>
    set((state) => {
      const blocks = state.historyBuffer.redo()
      if (!blocks) return state

      return {
        email: {
          ...state.email,
          blocks,
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  canUndo: () => {
    const state = get()
    return state.historyBuffer.canUndo()
  },

  canRedo: () => {
    const state = get()
    return state.historyBuffer.canRedo()
  },

  // Save Actions
  markAsSaved: () =>
    set((state) => ({
      editorState: {
        ...state.editorState,
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
      },
    })),

  markAsDirty: () =>
    set((state) => ({
      editorState: {
        ...state.editorState,
        isDirty: true,
      },
    })),

  loadEmail: (email) =>
    set((state) => {
      // Reset history buffer when loading a new email
      state.historyBuffer.clear()
      state.historyBuffer.push(email.blocks)

      return {
        email,
        editorState: {
          selectedBlockId: null,
          editingBlockId: null,
          editingType: null,
          draggedBlockId: null,
          selectedGalleryImageIndex: 0,
          viewport: { mode: 'desktop', zoom: 120 },
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
        },
      }
    }),

  createNewEmail: () =>
    set((state) => {
      // Reset history buffer when creating a new email
      state.historyBuffer.clear()
      state.historyBuffer.push([])

      return {
        email: createNewEmail(),
        editorState: {
          selectedBlockId: null,
          editingBlockId: null,
          editingType: null,
          draggedBlockId: null,
          selectedGalleryImageIndex: 0,
          viewport: { mode: 'desktop', zoom: 120 },
          isDirty: false,
          isSaving: false,
          lastSaved: null,
        },
      }
    }),

  loadTemplate: (template) =>
    set((state) => {
      try {
        // 1. Validate template structure
        const validated = validateTemplate(template)

        // 2. Strip stock content to placeholders
        const stripped = stripToPlaceholders(validated)

        // 3. Ensure correct order properties
        const blocksWithOrder = stripped.blocks.map((block, index) => ({
          ...block,
          order: index
        } as EmailBlock))

        // 4. Reset history buffer
        state.historyBuffer.clear()
        state.historyBuffer.push(blocksWithOrder)

        // 5. Get template metadata (works with both formats)
        const meta = getTemplateMetadata(template)

        // 6. Update email state
        return {
          email: {
            ...state.email,
            title: meta.name || 'Untitled Email',
            blocks: blocksWithOrder,
            settings: {
              ...state.email.settings,
              ...validated.settings,
              contentWidth: 640,
              // Ensure brandColors is always BrandColor[], not string[]
              brandColors: Array.isArray(validated.settings.brandColors)
                ? validated.settings.brandColors.map((c, index) =>
                    typeof c === 'string' ? { color: c, order: index } : c
                  )
                : state.email.settings.brandColors,
            },
            updatedAt: new Date(),
          },
          editorState: {
            selectedBlockId: null,
            editingBlockId: null,
            editingType: null,
            draggedBlockId: null,
            selectedGalleryImageIndex: 0,
            viewport: { mode: 'mobile', zoom: 120 },
            isDirty: true,  // Mark as dirty
            isSaving: false,
            lastSaved: null,
          },
          activeSidebarTab: 'content',
        }
      } catch (error: any) {
        console.error('Failed to load template:', error)

        // Show user-friendly error
        if (typeof window !== 'undefined') {
          alert(`Template Error: ${error.message || 'Failed to load template'}`)
        }

        // Return unchanged state on error
        return state
      }
    }),

    // Version Management Actions
    createVersion: (type, message) => {
      const state = get()
      const version = state.versionManager.createVersion(state.email.blocks, type, message)

      // Add to email history
      const newHistory = [...state.email.history, version]

      // Prune if needed
      const prunedHistory = state.versionManager.pruneVersions(newHistory)

      set({
        email: {
          ...state.email,
          history: prunedHistory,
          updatedAt: new Date(),
        },
      })

      return version
    },

    restoreVersion: (versionId) =>
      set((state) => {
        const version = state.email.history.find((v) => v.id === versionId)
        if (!version) return state

        // Create a checkpoint before restoring
        const checkpoint = state.versionManager.createVersion(
          state.email.blocks,
          'checkpoint',
          `Before restoring to: ${state.versionManager.formatTimestamp(version.timestamp)}`
        )

        // Add checkpoint to history
        const newHistory = [...state.email.history, checkpoint]

        // Reset undo/redo history when restoring
        state.historyBuffer.clear()
        state.historyBuffer.push(version.blocks)

        return {
          email: {
            ...state.email,
            blocks: JSON.parse(JSON.stringify(version.blocks)), // Deep clone
            history: newHistory,
            updatedAt: new Date(),
          },
          editorState: {
            ...state.editorState,
            isDirty: true,
            selectedBlockId: null,
            editingBlockId: null,
            editingType: null,
          },
        }
      }),

    pruneVersions: () =>
      set((state) => {
        const prunedHistory = state.versionManager.pruneVersions(state.email.history)

        return {
          email: {
            ...state.email,
            history: prunedHistory,
          },
        }
      }),

    getVersions: () => {
      const state = get()
      return state.email.history
    },

    deleteVersion: (versionId) =>
      set((state) => ({
        email: {
          ...state.email,
          history: state.email.history.filter((v) => v.id !== versionId),
          updatedAt: new Date(),
        },
      })),
}))
