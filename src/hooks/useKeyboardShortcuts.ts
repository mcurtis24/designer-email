/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for undo/redo and other actions
 */

import { useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'

export function useKeyboardShortcuts() {
  const undo = useEmailStore((state) => state.undo)
  const redo = useEmailStore((state) => state.redo)
  const canUndo = useEmailStore((state) => state.canUndo())
  const canRedo = useEmailStore((state) => state.canRedo())
  const deleteBlock = useEmailStore((state) => state.deleteBlock)
  const duplicateBlock = useEmailStore((state) => state.duplicateBlock)
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)
  const editingBlockId = useEmailStore((state) => state.editorState.editingBlockId)
  const selectBlock = useEmailStore((state) => state.selectBlock)
  const clearEditingBlock = useEmailStore((state) => state.clearEditingBlock)
  const blocks = useEmailStore((state) => state.email.blocks)
  const addBlock = useEmailStore((state) => state.addBlock)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input/textarea/contenteditable
      const target = e.target as HTMLElement
      const isTyping =
        editingBlockId ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Undo: Cmd/Ctrl + Z (not when typing)
      if (modifier && e.key === 'z' && !e.shiftKey && !isTyping) {
        e.preventDefault()
        if (canUndo) {
          undo()
        }
        return
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y (not when typing)
      if (modifier && !isTyping && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault()
        if (canRedo) {
          redo()
        }
        return
      }

      // Duplicate: Cmd/Ctrl + D (when block selected, not when typing)
      if (modifier && e.key === 'd' && selectedBlockId && !isTyping) {
        e.preventDefault()
        duplicateBlock(selectedBlockId)
        return
      }

      // Delete: Delete or Backspace (when block selected but not editing)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId && !isTyping) {
        e.preventDefault()
        deleteBlock(selectedBlockId)
        return
      }

      // Escape: Deselect block or exit editing mode
      if (e.key === 'Escape') {
        if (editingBlockId) {
          clearEditingBlock()
        } else if (selectedBlockId) {
          selectBlock(null)
        }
        return
      }

      // Copy: Cmd/Ctrl + C (when block selected, not when typing)
      if (modifier && e.key === 'c' && selectedBlockId && !isTyping) {
        e.preventDefault()
        const block = blocks.find((b) => b.id === selectedBlockId)
        if (block) {
          // Store in localStorage as clipboard
          localStorage.setItem('emailBuilderClipboard', JSON.stringify(block))
          console.log('Block copied to clipboard')
        }
        return
      }

      // Paste: Cmd/Ctrl + V (not when typing)
      if (modifier && e.key === 'v' && !isTyping) {
        e.preventDefault()
        const clipboardData = localStorage.getItem('emailBuilderClipboard')
        if (clipboardData) {
          try {
            const copiedBlock = JSON.parse(clipboardData)
            // Create a new block based on the copied one
            const newBlock = {
              ...copiedBlock,
              id: `${copiedBlock.type}-${Date.now()}`,
              order: blocks.length,
            }
            addBlock(newBlock)
            selectBlock(newBlock.id)
            console.log('Block pasted from clipboard')
          } catch (error) {
            console.error('Failed to paste block:', error)
          }
        }
        return
      }

      // Arrow keys: Navigate between blocks (when block selected, not when typing)
      if (selectedBlockId && !isTyping && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
        const currentIndex = sortedBlocks.findIndex((b) => b.id === selectedBlockId)

        if (currentIndex !== -1) {
          if (e.key === 'ArrowUp' && currentIndex > 0) {
            selectBlock(sortedBlocks[currentIndex - 1].id)
          } else if (e.key === 'ArrowDown' && currentIndex < sortedBlocks.length - 1) {
            selectBlock(sortedBlocks[currentIndex + 1].id)
          }
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedBlockId,
    editingBlockId,
    deleteBlock,
    duplicateBlock,
    selectBlock,
    clearEditingBlock,
    blocks,
    addBlock,
  ])
}
