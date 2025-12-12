import { useRef, useState, useEffect, useCallback, memo } from 'react'
import type { EmailBlock, TextBlockData } from '@/types/email'
import { useEmailStore } from '@/stores/emailStore'
import { applyFormatToSelection, sanitizeEmailHTML } from '@/lib/richTextUtils'
import DOMPurify from 'dompurify'

interface TextBlockProps {
  block: EmailBlock & { data: TextBlockData }
  isSelected?: boolean
  onClick?: () => void
  onFormatRequest?: (handler: (command: string, value?: string) => void) => void
  onActiveStatesChange?: (states: { isBold: boolean; isItalic: boolean; isUnderline: boolean }) => void
}

// Debounce helper
const debounce = (fn: Function, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

function TextBlock({ block, isSelected, onClick, onFormatRequest, onActiveStatesChange }: TextBlockProps) {
  const { data, styles } = block
  const contentRef = useRef<HTMLDivElement>(null)
  const hasInitializedRef = useRef(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeStates, setActiveStates] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
  })
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const flushBatchedChanges = useEmailStore((state) => state.flushBatchedChanges)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)
  const setEditingBlock = useEmailStore((state) => state.setEditingBlock)
  const clearEditingBlock = useEmailStore((state) => state.clearEditingBlock)
  const editingBlockId = useEmailStore((state) => state.editorState.editingBlockId)
  const selectedBlockId = useEmailStore((state) => state.editorState.selectedBlockId)

  // Get computed styles at current cursor position
  const getCurrentSelectionStyles = () => {
    if (!contentRef.current) return {}

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return {}

    let element = selection.anchorNode
    if (!element) return {}

    // If it's a text node, get its parent element
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement
    }

    if (!element || !contentRef.current.contains(element as Node)) return {}

    const computedStyles = window.getComputedStyle(element as Element)

    return {
      fontSize: computedStyles.fontSize,
      fontFamily: computedStyles.fontFamily.replace(/['"]/g, '').split(',')[0].trim(),
      color: computedStyles.color,
    }
  }

  // Update block styles based on current selection
  const updateBlockStylesFromSelection = () => {
    const selectionStyles = getCurrentSelectionStyles()

    if (Object.keys(selectionStyles).length === 0) return

    const updates: any = { ...data }
    let hasChanges = false

    // Update font family
    if (selectionStyles.fontFamily && selectionStyles.fontFamily !== data.fontFamily) {
      updates.fontFamily = selectionStyles.fontFamily
      hasChanges = true
    }

    // Update font size
    if (selectionStyles.fontSize && selectionStyles.fontSize !== data.fontSize) {
      updates.fontSize = selectionStyles.fontSize
      hasChanges = true
    }

    // Update color (convert RGB to hex if needed)
    if (selectionStyles.color) {
      const rgb = selectionStyles.color.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        const hex = '#' + rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
        if (hex !== data.color) {
          updates.color = hex
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      updateBlock(block.id, { data: updates })
    }
  }

  // Helper to save selection as offsets (more robust across DOM changes)
  const saveSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !contentRef.current) return null

    const range = selection.getRangeAt(0)

    // Calculate offsets relative to contentRef
    const preSelectionRange = range.cloneRange()
    preSelectionRange.selectNodeContents(contentRef.current)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)
    const start = preSelectionRange.toString().length

    return {
      start,
      end: start + range.toString().length,
      isCollapsed: range.collapsed
    }
  }

  // Helper to restore selection from offsets
  const restoreSelection = (savedSelection: { start: number; end: number; isCollapsed: boolean } | null) => {
    if (!savedSelection || !contentRef.current) return

    try {
      // Ensure element has focus
      contentRef.current.focus()

      const selection = window.getSelection()
      const range = document.createRange()

      let charIndex = 0
      let nodeStack = [contentRef.current]
      let node: Node | undefined
      let foundStart = false
      let stop = false

      // Find start and end nodes
      let startNode: Node | null = null
      let startOffset = 0
      let endNode: Node | null = null
      let endOffset = 0

      while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharIndex = charIndex + (node.textContent?.length || 0)

          if (!foundStart && savedSelection.start >= charIndex && savedSelection.start <= nextCharIndex) {
            startNode = node
            startOffset = savedSelection.start - charIndex
            foundStart = true
          }

          if (foundStart && savedSelection.end >= charIndex && savedSelection.end <= nextCharIndex) {
            endNode = node
            endOffset = savedSelection.end - charIndex
            stop = true
          }

          charIndex = nextCharIndex
        } else {
          let i = node.childNodes.length
          while (i--) {
            nodeStack.push(node.childNodes[i])
          }
        }
      }

      if (startNode && endNode) {
        range.setStart(startNode, startOffset)
        range.setEnd(endNode, endOffset)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    } catch (e) {
      console.warn('Could not restore selection:', e)
    }
  }

  const handleFormat = (command: string, value?: string) => {
    if (!contentRef.current) return

    // Save current selection BEFORE any operations
    const savedRange = saveSelection()

    // Ensure the contentEditable has focus
    if (document.activeElement !== contentRef.current) {
      contentRef.current.focus()
    }

    // Track additional data updates (like fontSize)
    const dataUpdates: any = {}

    // Apply formatting using execCommand which maintains cursor position
    try {
      switch (command) {
        case 'bold':
          document.execCommand('bold', false)
          break
        case 'italic':
          document.execCommand('italic', false)
          break
        case 'underline':
          document.execCommand('underline', false)
          break
        case 'insertUnorderedList':
          document.execCommand('insertUnorderedList', false)
          break
        case 'insertOrderedList':
          document.execCommand('insertOrderedList', false)
          break
        case 'align':
          if (value === 'left') document.execCommand('justifyLeft', false)
          else if (value === 'center') document.execCommand('justifyCenter', false)
          else if (value === 'right') document.execCommand('justifyRight', false)
          break
        case 'color':
          if (value) {
            document.execCommand('foreColor', false, value)
            // Queue block data property update
            dataUpdates.color = value
          }
          break
        case 'fontFamily':
          if (value) {
            document.execCommand('fontName', false, value)
            // Queue block data property update
            dataUpdates.fontFamily = value
          }
          break
        case 'fontSize':
          if (value) {
            const selection = window.getSelection()

            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
              // User has selected text - apply to selection only
              const range = selection.getRangeAt(0)

              // Extract the selected content
              const fragment = range.extractContents()

              // Create a temporary container to process the fragment
              const tempDiv = document.createElement('div')
              tempDiv.appendChild(fragment)

              // Remove any existing fontSize styles from spans
              const spans = tempDiv.querySelectorAll('span[style*="font-size"]')
              spans.forEach(span => {
                span.style.fontSize = ''
                // If the span has no other styles, unwrap it
                if (!span.getAttribute('style') || span.getAttribute('style')?.trim() === '') {
                  const parent = span.parentNode
                  while (span.firstChild) {
                    parent?.insertBefore(span.firstChild, span)
                  }
                  parent?.removeChild(span)
                }
              })

              // Create new span with the fontSize
              const newSpan = document.createElement('span')
              newSpan.style.fontSize = value

              // Move ALL children from tempDiv to newSpan (not just first child!)
              while (tempDiv.firstChild) {
                newSpan.appendChild(tempDiv.firstChild)
              }

              // Insert the new span at the range position
              range.insertNode(newSpan)

              // Select the newly inserted content
              range.selectNodeContents(newSpan)
              selection.removeAllRanges()
              selection.addRange(range)
            }

            // Queue block-level font size update
            dataUpdates.fontSize = value
          }
          break
        case 'link':
          if (value) {
            document.execCommand('createLink', false, value)
          }
          break
      }

      // Get updated content IMMEDIATELY after execCommand
      const newContent = sanitizeEmailHTML(contentRef.current.innerHTML)

      // Update block state with batching for formatting operations
      // This groups rapid formatting changes (e.g., clicking font size +/- multiple times)
      updateBlock(block.id, {
        data: {
          ...data,
          ...dataUpdates,
          content: newContent,
        },
      }, { batch: true })

      // Restore selection and update states after brief delay for DOM to settle
      requestAnimationFrame(() => {
        restoreSelection(savedRange)
        updateActiveStates()
      })
    } catch (e) {
      console.error('Error applying format:', e)
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on toolbar buttons, canvas toolbar, or sidebar controls
    if (e.relatedTarget) {
      const target = e.relatedTarget as HTMLElement
      if (target.closest('.rich-text-toolbar') ||
          target.closest('.canvas-toolbar') ||
          target.closest('.right-sidebar')) {
        return
      }
    }

    if (!contentRef.current) return

    // Flush any batched formatting changes before final save
    flushBatchedChanges()

    const newContent = sanitizeEmailHTML(contentRef.current.innerHTML)

    // Only update if content changed
    if (newContent !== data.content) {
      updateBlock(block.id, {
        data: {
          ...data,
          content: newContent,
        },
      })
    }

    setIsEditing(false)
    clearEditingBlock()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isEditing) {
      // Select the block first
      onClick?.()

      // Switch to Style tab
      setActiveSidebarTab('style')

      // Enter editing mode
      setIsEditing(true)
      setEditingBlock(block.id, 'text')
    }
  }

  // Initialize cursor position when entering edit mode - ONLY ONCE
  useEffect(() => {
    if (isEditing && contentRef.current && !hasInitializedRef.current) {
      // Set content and focus - only on first initialization
      contentRef.current.innerHTML = data.content
      contentRef.current.focus()

      // Position cursor at end
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(contentRef.current)
      range.collapse(false) // false = end, true = start
      selection?.removeAllRanges()
      selection?.addRange(range)

      hasInitializedRef.current = true
    } else if (!isEditing) {
      // Reset flag when exiting edit mode
      hasInitializedRef.current = false
    }
  }, [isEditing, data.content])

  // Update active formatting states based on current selection
  const updateActiveStates = () => {
    if (!contentRef.current || document.activeElement !== contentRef.current) return

    try {
      const newStates = {
        isBold: document.queryCommandState('bold'),
        isItalic: document.queryCommandState('italic'),
        isUnderline: document.queryCommandState('underline'),
      }
      setActiveStates(newStates)
      onActiveStatesChange?.(newStates)
    } catch (e) {
      // queryCommandState can throw in some browsers
      console.error('Error updating active states:', e)
    }
  }

  // Expose format handler to parent when editing
  useEffect(() => {
    if (isEditing && editingBlockId === block.id) {
      onFormatRequest?.(handleFormat)
    }
  }, [isEditing, editingBlockId, block.id])

  // Debounced selection change handler - prevents excessive re-renders
  const debouncedSelectionChange = useCallback(
    debounce(() => {
      if (isEditing && contentRef.current && document.activeElement === contentRef.current) {
        updateActiveStates()
        // Don't update block styles on every selection change - only on blur
      }
    }, 150),
    [isEditing]
  )

  // Add selection change listener when editing
  useEffect(() => {
    if (isEditing) {
      document.addEventListener('selectionchange', debouncedSelectionChange)
      return () => {
        document.removeEventListener('selectionchange', debouncedSelectionChange)
      }
    }
  }, [isEditing, debouncedSelectionChange])

  // Exit editing mode when a different block is selected
  useEffect(() => {
    if (isEditing && selectedBlockId !== block.id) {
      // Another block was selected while we were editing
      // Flush any batched formatting changes before final save
      flushBatchedChanges()

      // Save current content and exit editing mode
      if (contentRef.current) {
        const newContent = sanitizeEmailHTML(contentRef.current.innerHTML)
        if (newContent !== data.content) {
          updateBlock(block.id, {
            data: {
              ...data,
              content: newContent,
            },
          })
        }
      }
      setIsEditing(false)
      clearEditingBlock()
    }
  }, [selectedBlockId, isEditing, block.id, flushBatchedChanges])

  return (
    <div className="relative">
      {isEditing ? (
        <div
          className="border-2 border-blue-500 shadow-sm"
          onClick={(e) => e.stopPropagation()}
          style={{
            paddingTop: styles.padding?.top,
            paddingRight: styles.padding?.right,
            paddingBottom: styles.padding?.bottom,
            paddingLeft: styles.padding?.left,
            backgroundColor: styles.backgroundColor || 'white',
            textAlign: styles.textAlign,
          }}
        >
          <div
            ref={contentRef}
            contentEditable={true}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent focus:outline-none"
            style={{
              fontFamily: data.fontFamily,
              fontSize: data.fontSize,
              color: data.color,
              lineHeight: data.lineHeight,
              outline: 'none',
              cursor: 'text',
              paddingLeft: styles.padding?.left, // Use user's padding setting
            }}
          />
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`cursor-pointer transition-all min-h-[40px] border-2 border-transparent ${
            isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
          }`}
          style={{
            fontFamily: data.fontFamily,
            fontSize: data.fontSize,
            color: data.color,
            lineHeight: data.lineHeight,
            paddingTop: styles.padding?.top,
            paddingRight: styles.padding?.right,
            paddingBottom: styles.padding?.bottom,
            paddingLeft: styles.padding?.left,
            backgroundColor: styles.backgroundColor,
            textAlign: styles.textAlign,
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(data.content || '<p style="color: #9ca3af;">Click to add text...</p>', {
              ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'a', 'span', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
              ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
              ALLOW_DATA_ATTR: false
            })
          }}
        />
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders when sibling blocks update
export default memo(TextBlock, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.block.data) === JSON.stringify(nextProps.block.data) &&
    JSON.stringify(prevProps.block.styles) === JSON.stringify(nextProps.block.styles)
  )
})
