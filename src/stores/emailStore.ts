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
  SocialLink,
  SocialPlatform,
  TypographyStyle,
  SavedComponent,
  UserTemplate,
  TemplateCategory,
  TemplateVersion,
} from '@/types/email'
import { CircularHistoryBuffer, ActionBatcher } from '@/lib/historyManager'
import { VersionManager } from '@/lib/versionManager'
import { validateTemplate } from '@/lib/templateValidator'
import { stripToPlaceholders } from '@/lib/templatePlaceholders'
import { getTemplateMetadata } from '@/lib/templates'
import { isLayoutBlock } from '@/lib/typeGuards'

interface EmailStore {
  // Email Document State
  email: EmailDocument

  // Editor UI State
  editorState: EditorState

  // Sidebar UI State
  activeSidebarTab: 'content' | 'blocks' | 'style' | 'templates' | 'assets' | 'branding'
  autoOpenColorPicker: boolean

  // UI State (collapsible sections, etc.)
  uiState: {
    collapsedSections: { [sectionKey: string]: boolean }
  }

  // Saved Components (persisted in localStorage)
  savedComponents: SavedComponent[]

  // User Templates (persisted in localStorage)
  userTemplates: UserTemplate[]

  // Track which template is currently loaded (for update feature)
  loadedTemplateId: string | null

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

  // Actions - UI State
  setSectionState: (blockType: string, sectionName: string, isOpen: boolean) => void
  collapseAllSections: () => void
  expandAllSections: () => void

  // Actions - Viewport
  setViewportMode: (mode: ViewportState['mode']) => void
  setZoom: (zoom: number) => void

  // Actions - Brand Colors
  addBrandColor: (color: string, name?: string) => void
  removeBrandColor: (color: string) => void
  updateBrandColorName: (color: string, name: string) => void
  reorderBrandColors: (colors: BrandColor[]) => void

  // Actions - Social Links
  addSocialLink: (platform: SocialPlatform, url: string, iconUrl?: string) => void
  removeSocialLink: (platform: SocialPlatform) => void
  updateSocialLink: (platform: SocialPlatform, url: string, iconUrl?: string) => void
  reorderSocialLinks: (links: SocialLink[]) => void

  // Actions - Typography Styles
  updateTypographyStyle: (styleName: 'heading' | 'body', updates: Partial<TypographyStyle>) => void
  applyTypographyStyleToAll: (styleName: 'heading' | 'body') => void
  resetTypographyStyles: () => void

  // Actions - Saved Components
  saveComponent: (blockId: string, name: string, category?: string) => void
  loadSavedComponent: (componentId: string) => EmailBlock
  deleteSavedComponent: (componentId: string) => void
  getSavedComponents: () => SavedComponent[]

  // Actions - User Templates
  saveEmailAsTemplate: (name: string, category: TemplateCategory, description?: string, tags?: string[]) => Promise<void>
  loadUserTemplate: (templateId: string) => void
  deleteUserTemplate: (templateId: string) => void
  updateUserTemplate: (templateId: string, updates: Partial<Pick<UserTemplate, 'name' | 'description' | 'category' | 'tags'>>) => void
  updateTemplateContent: (templateId?: string) => Promise<void>
  duplicateUserTemplate: (templateId: string) => Promise<void>
  getUserTemplates: () => UserTemplate[]
  exportUserTemplate: (templateId: string) => string
  importUserTemplate: (jsonString: string) => void
  createTemplateVersion: (templateId: string, message?: string) => void
  restoreTemplateVersion: (templateId: string, versionId: string) => void
  getTemplateVersions: (templateId: string) => TemplateVersion[]
  deleteMultipleTemplates: (templateIds: string[]) => void
  exportMultipleTemplates: (templateIds: string[]) => void

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
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'x', url: 'https://twitter.com' },
        { platform: 'instagram', url: 'https://instagram.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
      ],
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

// Helper functions for localStorage persistence
const SAVED_COMPONENTS_KEY = 'email-designer-saved-components'
const USER_TEMPLATES_KEY = 'email-designer-user-templates'

function loadSavedComponentsFromStorage(): SavedComponent[] {
  try {
    const stored = localStorage.getItem(SAVED_COMPONENTS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    // Convert date strings back to Date objects
    return parsed.map((comp: any) => ({
      ...comp,
      createdAt: new Date(comp.createdAt),
    }))
  } catch (error) {
    console.error('Failed to load saved components from localStorage:', error)
    return []
  }
}

function saveSavedComponentsToStorage(components: SavedComponent[]) {
  try {
    localStorage.setItem(SAVED_COMPONENTS_KEY, JSON.stringify(components))
  } catch (error) {
    console.error('Failed to save components to localStorage:', error)
  }
}

function loadUserTemplatesFromStorage(): UserTemplate[] {
  try {
    const stored = localStorage.getItem(USER_TEMPLATES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    // Convert date strings back to Date objects
    return parsed.map((template: any) => ({
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt),
      thumbnailGeneratedAt: new Date(template.thumbnailGeneratedAt),
      lastUsedAt: template.lastUsedAt ? new Date(template.lastUsedAt) : undefined,
    }))
  } catch (error) {
    console.error('Failed to load user templates from localStorage:', error)
    return []
  }
}

function saveUserTemplatesToStorage(templates: UserTemplate[]) {
  try {
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error('Failed to save user templates to localStorage:', error)
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

    uiState: {
      collapsedSections: {},
    },

    savedComponents: loadSavedComponentsFromStorage(),
    userTemplates: loadUserTemplatesFromStorage(),
    loadedTemplateId: null,

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
        if (isLayoutBlock(block)) {
          const updatedChildren = block.data.children.map(updateBlockRecursive)

          // Only create new block if children actually changed
          if (updatedChildren.some((child: EmailBlock, i: number) => child !== block.data.children[i])) {
            return {
              ...block,
              data: {
                ...block.data,
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
        if (b.id === layoutBlockId && isLayoutBlock(b)) {
          const newChildren = [...b.data.children]
          newChildren[columnIndex] = block

          return {
            ...b,
            data: {
              ...b.data,
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

  // UI State Actions
  setSectionState: (blockType, sectionName, isOpen) =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        collapsedSections: {
          ...state.uiState.collapsedSections,
          [`${blockType}:${sectionName}`]: isOpen,
        },
      },
    })),

  collapseAllSections: () =>
    set((state) => {
      const collapsed: { [key: string]: boolean } = {}
      Object.keys(state.uiState.collapsedSections).forEach(key => {
        collapsed[key] = false
      })
      return {
        uiState: {
          ...state.uiState,
          collapsedSections: collapsed,
        },
      }
    }),

  expandAllSections: () =>
    set((state) => {
      const expanded: { [key: string]: boolean } = {}
      Object.keys(state.uiState.collapsedSections).forEach(key => {
        expanded[key] = true
      })
      return {
        uiState: {
          ...state.uiState,
          collapsedSections: expanded,
        },
      }
    }),

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

  // Social Links Actions
  addSocialLink: (platform, url, iconUrl) =>
    set((state) => {
      // Ensure socialLinks exists (migration for old emails)
      const currentSocialLinks = state.email.settings.socialLinks || []

      // Don't add duplicates
      if (currentSocialLinks.some((sl) => sl.platform === platform)) {
        return state
      }

      const newSocialLink: SocialLink = {
        platform,
        url,
        iconUrl,
      }

      return {
        email: {
          ...state.email,
          settings: {
            ...state.email.settings,
            socialLinks: [...currentSocialLinks, newSocialLink],
          },
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  removeSocialLink: (platform) =>
    set((state) => {
      const currentSocialLinks = state.email.settings.socialLinks || []
      return {
        email: {
          ...state.email,
          settings: {
            ...state.email.settings,
            socialLinks: currentSocialLinks.filter((sl) => sl.platform !== platform),
          },
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  updateSocialLink: (platform, url, iconUrl) =>
    set((state) => {
      const currentSocialLinks = state.email.settings.socialLinks || []
      return {
        email: {
          ...state.email,
          settings: {
            ...state.email.settings,
            socialLinks: currentSocialLinks.map((sl) =>
              sl.platform === platform ? { ...sl, url, iconUrl } : sl
            ),
          },
          updatedAt: new Date(),
        },
        editorState: { ...state.editorState, isDirty: true },
      }
    }),

  reorderSocialLinks: (links) =>
    set((state) => ({
      email: {
        ...state.email,
        settings: {
          ...state.email.settings,
          socialLinks: links,
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

  // Saved Components Actions
  saveComponent: (blockId, name, category) =>
    set((state) => {
      // Find the block to save
      const block = state.email.blocks.find((b) => b.id === blockId)
      if (!block) return state

      // Create a copy of the block with a new ID
      const componentBlock: EmailBlock = {
        ...block,
        id: nanoid(), // Generate new ID for the component
      }

      // Create the saved component
      const savedComponent: SavedComponent = {
        id: nanoid(),
        name,
        block: componentBlock,
        createdAt: new Date(),
        category,
      }

      const newComponents = [...state.savedComponents, savedComponent]
      saveSavedComponentsToStorage(newComponents)

      return {
        savedComponents: newComponents,
      }
    }),

  loadSavedComponent: (componentId) => {
    const state = get()
    const component = state.savedComponents.find((c) => c.id === componentId)
    if (!component) {
      throw new Error(`Saved component not found: ${componentId}`)
    }

    // Return a copy with a new ID
    return {
      ...component.block,
      id: nanoid(),
    }
  },

  deleteSavedComponent: (componentId) =>
    set((state) => {
      const newComponents = state.savedComponents.filter((c) => c.id !== componentId)
      saveSavedComponentsToStorage(newComponents)

      return {
        savedComponents: newComponents,
      }
    }),

  getSavedComponents: () => {
    const state = get()
    return state.savedComponents
  },

  // User Template Actions
  saveEmailAsTemplate: async (name, category, description, tags = []) => {
    const state = get()
    const { email } = state

    // Import thumbnail generator
    const { generateThumbnail } = await import('@/lib/thumbnailGenerator')

    // Generate thumbnail (async operation)
    const thumbnail = await generateThumbnail(email)

    // Create new template
    const newTemplate: UserTemplate = {
      id: nanoid(),
      name,
      description,
      category,
      tags,
      blocks: JSON.parse(JSON.stringify(email.blocks)), // Deep copy
      settings: JSON.parse(JSON.stringify(email.settings)), // Deep copy
      thumbnail,
      thumbnailGeneratedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      useCount: 0,
      source: 'user',
      version: 1,
    }

    const newTemplates = [...state.userTemplates, newTemplate]
    saveUserTemplatesToStorage(newTemplates)

    set({
      userTemplates: newTemplates,
    })
  },

  loadUserTemplate: (templateId) => {
    const state = get()
    const template = state.userTemplates.find((t) => t.id === templateId)

    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return
    }

    // Clear history buffer for new email
    state.historyBuffer.clear()

    // Load template blocks and settings
    const loadedBlocks = JSON.parse(JSON.stringify(template.blocks)) // Deep copy
    const loadedSettings = JSON.parse(JSON.stringify(template.settings)) // Deep copy

    // Regenerate IDs for all blocks to avoid conflicts
    const regenerateIds = (blocks: EmailBlock[]): EmailBlock[] => {
      return blocks.map((block) => {
        const newBlock = { ...block, id: nanoid() }

        // Regenerate IDs for nested blocks in layouts
        if (isLayoutBlock(block)) {
          if (block.data.children && Array.isArray(block.data.children)) {
            newBlock.data = {
              ...block.data,
              children: regenerateIds(block.data.children),
            }
          }
        }

        return newBlock
      })
    }

    const blocksWithNewIds = regenerateIds(loadedBlocks)

    // Update email with template content
    state.historyBuffer.push(blocksWithNewIds)

    set((state) => ({
      email: {
        ...state.email,
        blocks: blocksWithNewIds,
        settings: loadedSettings,
        updatedAt: new Date(),
      },
      editorState: {
        ...state.editorState,
        selectedBlockId: null,
        isDirty: true,
      },
      // Track loaded template for update feature
      loadedTemplateId: templateId,
      // Update template usage stats
      userTemplates: state.userTemplates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              lastUsedAt: new Date(),
              useCount: t.useCount + 1,
            }
          : t
      ),
    }))

    // Save updated usage stats
    saveUserTemplatesToStorage(get().userTemplates)
  },

  deleteUserTemplate: (templateId) =>
    set((state) => {
      const newTemplates = state.userTemplates.filter((t) => t.id !== templateId)
      saveUserTemplatesToStorage(newTemplates)

      return {
        userTemplates: newTemplates,
      }
    }),

  updateUserTemplate: (templateId, updates) =>
    set((state) => {
      const newTemplates = state.userTemplates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              ...updates,
              updatedAt: new Date(),
            }
          : t
      )

      saveUserTemplatesToStorage(newTemplates)

      return {
        userTemplates: newTemplates,
      }
    }),

  updateTemplateContent: async (templateId?: string) => {
    const state = get()
    const targetId = templateId || state.loadedTemplateId

    if (!targetId) {
      console.error('No template ID provided and no template is currently loaded')
      return
    }

    const template = state.userTemplates.find((t) => t.id === targetId)

    if (!template) {
      console.error(`Template not found: ${targetId}`)
      return
    }

    // Create version snapshot before updating
    get().createTemplateVersion(targetId, 'Auto-save before update')

    try {
      // Deep copy current email blocks and settings
      const updatedBlocks = JSON.parse(JSON.stringify(state.email.blocks))
      const updatedSettings = JSON.parse(JSON.stringify(state.email.settings))

      // Generate new thumbnail
      const { generateThumbnail } = await import('@/lib/thumbnailGenerator')
      let newThumbnail = template.thumbnail

      try {
        newThumbnail = await generateThumbnail(state.email, {
          width: 320,
          quality: 0.7,
          scale: 0.5,
        })
      } catch (err) {
        console.error('Failed to regenerate thumbnail, keeping old one:', err)
      }

      // Update template
      const newTemplates = state.userTemplates.map((t) =>
        t.id === targetId
          ? {
              ...t,
              blocks: updatedBlocks,
              settings: updatedSettings,
              thumbnail: newThumbnail,
              thumbnailGeneratedAt: new Date(),
              updatedAt: new Date(),
            }
          : t
      )

      saveUserTemplatesToStorage(newTemplates)

      set({
        userTemplates: newTemplates,
      })
    } catch (error) {
      console.error('Failed to update template content:', error)
      throw error
    }
  },

  duplicateUserTemplate: async (templateId) => {
    const state = get()
    const template = state.userTemplates.find((t) => t.id === templateId)

    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return
    }

    // Create duplicate with new ID and name
    const duplicate: UserTemplate = {
      ...JSON.parse(JSON.stringify(template)), // Deep copy
      id: nanoid(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: undefined,
      useCount: 0,
    }

    const newTemplates = [...state.userTemplates, duplicate]
    saveUserTemplatesToStorage(newTemplates)

    set({
      userTemplates: newTemplates,
    })
  },

  getUserTemplates: () => {
    const state = get()
    return state.userTemplates
  },

  exportUserTemplate: (templateId) => {
    const state = get()
    const template = state.userTemplates.find((t) => t.id === templateId)

    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    return JSON.stringify(template, null, 2)
  },

  importUserTemplate: (jsonString) => {
    try {
      const imported = JSON.parse(jsonString)

      // Validate required fields
      if (!imported.name || !imported.blocks || !imported.settings) {
        throw new Error('Invalid template format')
      }

      // Create new template with fresh ID and dates
      const newTemplate: UserTemplate = {
        ...imported,
        id: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnailGeneratedAt: imported.thumbnailGeneratedAt
          ? new Date(imported.thumbnailGeneratedAt)
          : new Date(),
        lastUsedAt: undefined,
        useCount: 0,
        source: 'imported' as const,
        version: imported.version || 1,
      }

      const state = get()
      const newTemplates = [...state.userTemplates, newTemplate]
      saveUserTemplatesToStorage(newTemplates)

      set({
        userTemplates: newTemplates,
      })
    } catch (error) {
      console.error('Failed to import template:', error)
      throw new Error('Invalid template file')
    }
  },

  createTemplateVersion: (templateId, message) => {
    const state = get()
    const template = state.userTemplates.find((t) => t.id === templateId)

    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return
    }

    // Create new version snapshot
    const newVersion: TemplateVersion = {
      id: nanoid(),
      timestamp: new Date(),
      blocks: JSON.parse(JSON.stringify(template.blocks)), // Deep copy
      settings: JSON.parse(JSON.stringify(template.settings)), // Deep copy
      message,
      thumbnail: template.thumbnail,
    }

    // Get existing versions and add new one at the beginning
    const versions = template.versions || []
    const updatedVersions = [newVersion, ...versions].slice(0, 10) // Keep max 10 versions

    // Update template with new versions array
    const newTemplates = state.userTemplates.map((t) =>
      t.id === templateId ? { ...t, versions: updatedVersions } : t
    )

    saveUserTemplatesToStorage(newTemplates)
    set({ userTemplates: newTemplates })
  },

  restoreTemplateVersion: (templateId, versionId) => {
    const state = get()
    const template = state.userTemplates.find((t) => t.id === templateId)

    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return
    }

    const version = template.versions?.find((v) => v.id === versionId)

    if (!version) {
      console.error(`Version not found: ${versionId}`)
      return
    }

    // Create a checkpoint before restoring (save current state as a version)
    get().createTemplateVersion(templateId, 'Before restore')

    // Restore blocks and settings from version
    const newTemplates = state.userTemplates.map((t) =>
      t.id === templateId
        ? {
            ...t,
            blocks: JSON.parse(JSON.stringify(version.blocks)), // Deep copy
            settings: JSON.parse(JSON.stringify(version.settings)), // Deep copy
            updatedAt: new Date(),
          }
        : t
    )

    saveUserTemplatesToStorage(newTemplates)
    set({ userTemplates: newTemplates })
  },

  getTemplateVersions: (templateId) => {
    const state = get()
    const template = state.userTemplates.find((t) => t.id === templateId)

    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return []
    }

    return template.versions || []
  },

  deleteMultipleTemplates: (templateIds) => {
    const state = get()
    const newTemplates = state.userTemplates.filter((t) => !templateIds.includes(t.id))

    saveUserTemplatesToStorage(newTemplates)
    set({ userTemplates: newTemplates })
  },

  exportMultipleTemplates: (templateIds) => {
    const state = get()
    const templatesToExport = state.userTemplates.filter((t) => templateIds.includes(t.id))

    // Create individual JSON files for each template
    templatesToExport.forEach((template) => {
      const jsonString = JSON.stringify(template, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileName = `${template.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-template.json`
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  },

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
        loadedTemplateId: null, // Clear loaded template
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
          loadedTemplateId: null, // Clear loaded template (system templates can't be updated)
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
