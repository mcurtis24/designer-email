/**
 * Canvas Toolbar - Canva-Style Top Toolbar
 * Appears at top of canvas when editing text/heading blocks
 * Modern, elegant design with grouped controls
 */

import { useState, useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, HeadingBlockData } from '@/types/email'

interface CanvasToolbarProps {
  block: EmailBlock
  onFormat: (command: string, value?: string) => void
  activeStates?: {
    isBold?: boolean
    isItalic?: boolean
    isUnderline?: boolean
  }
}

export default function CanvasToolbar({ block, onFormat, activeStates = {} }: CanvasToolbarProps) {
  const clearEditingBlock = useEmailStore((state) => state.clearEditingBlock)
  const setActiveSidebarTab = useEmailStore((state) => state.setActiveSidebarTab)
  const setAutoOpenColorPicker = useEmailStore((state) => state.setAutoOpenColorPicker)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [currentFontSize, setCurrentFontSize] = useState<number>(16)
  const [currentFontFamily, setCurrentFontFamily] = useState<string>('Arial')

  const { isBold = false, isItalic = false, isUnderline = false } = activeStates
  const isHeading = block.type === 'heading'

  // Email-safe fonts
  const emailSafeFonts = [
    { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
    { name: 'Georgia', family: 'Georgia, Times, serif' },
    { name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
    { name: 'Courier New', family: '"Courier New", Courier, monospace' },
    { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
    { name: 'Impact', family: 'Impact, Charcoal, sans-serif' },
  ]

  // Update current font size from block data
  useEffect(() => {
    const blockData = block.data as any
    const fontSize = parseInt(blockData.fontSize || '16px')
    setCurrentFontSize(fontSize)
  }, [block])

  // Update current font family from block data
  useEffect(() => {
    const blockData = block.data as any
    const blockFontFamily = blockData.fontFamily || 'Arial, Helvetica, sans-serif'
    const matchingFont = emailSafeFonts.find(f =>
      blockFontFamily.includes(f.name)
    )
    setCurrentFontFamily(matchingFont?.name || 'Arial')
  }, [block])

  const handleBold = () => onFormat('bold')
  const handleItalic = () => onFormat('italic')
  const handleUnderline = () => onFormat('underline')
  const handleAlignment = (alignment: string) => onFormat('align', alignment)
  const handleList = (type: 'ul' | 'ol') => onFormat(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList')
  const handleFontFamily = (fontFamily: string) => {
    onFormat('fontFamily', fontFamily)
    setShowFontPicker(false)
  }

  const handleLink = () => setShowLinkInput(true)
  const applyLink = () => {
    if (linkUrl.trim()) {
      onFormat('link', linkUrl)
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const handleHeadingLevel = (level: 1 | 2 | 3) => {
    onFormat('headingLevel', level.toString())
  }

  const handleFontSize = (newSize: number) => {
    // Clamp between 8 and 72
    const clampedSize = Math.max(8, Math.min(72, newSize))
    setCurrentFontSize(clampedSize)
    onFormat('fontSize', `${clampedSize}px`)
  }

  const increaseFontSize = () => handleFontSize(currentFontSize + 2)
  const decreaseFontSize = () => handleFontSize(currentFontSize - 2)
  const handleFontSizeInput = (value: string) => {
    const parsed = parseInt(value)
    if (!isNaN(parsed)) {
      handleFontSize(parsed)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md animate-slideDown">
      <div className="h-[52px] px-4 flex items-center gap-2">
        {/* Heading Levels (only for heading blocks) */}
        {isHeading && (
          <>
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => handleHeadingLevel(level as 1 | 2 | 3)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors text-sm font-semibold ${
                    (block.data as HeadingBlockData).level === level
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title={`Heading ${level}`}
                  type="button"
                >
                  H{level}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        {/* Font Family Picker */}
        <div className="relative">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            onMouseDown={(e) => e.preventDefault()}
            className="h-9 px-3 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2 text-sm"
            title="Font Family"
            type="button"
          >
            <span className="text-gray-700">{currentFontFamily}</span>
            <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>

          {showFontPicker && (
            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[200px]">
              {emailSafeFonts.map((font) => (
                <button
                  key={font.family}
                  onClick={() => handleFontFamily(font.family)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm ${
                    currentFontFamily === font.name ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  style={{ fontFamily: font.family }}
                  type="button"
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Controls */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={decreaseFontSize}
            onMouseDown={(e) => e.preventDefault()}
            className="w-7 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
            title="Decrease Font Size"
            type="button"
          >
            <span className="text-base font-semibold select-none">−</span>
          </button>
          <input
            type="text"
            value={currentFontSize}
            onChange={(e) => handleFontSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                increaseFontSize()
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                decreaseFontSize()
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            onFocus={(e) => e.target.select()}
            className="w-12 h-9 text-center border-x border-gray-300 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Font Size (px)"
          />
          <button
            onClick={increaseFontSize}
            onMouseDown={(e) => e.preventDefault()}
            className="w-7 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
            title="Increase Font Size"
            type="button"
          >
            <span className="text-base font-semibold select-none">+</span>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Formatting Buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleBold}
            onMouseDown={(e) => e.preventDefault()}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Bold (Ctrl+B)"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>

          <button
            onClick={handleItalic}
            onMouseDown={(e) => e.preventDefault()}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Italic (Ctrl+I)"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
            </svg>
          </button>

          <button
            onClick={handleUnderline}
            onMouseDown={(e) => e.preventDefault()}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              isUnderline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Underline (Ctrl+U)"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color Button - Opens Style Sidebar */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setActiveSidebarTab('style')
            setAutoOpenColorPicker(true)
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="w-9 h-9 flex flex-col items-center justify-center rounded-md hover:bg-gray-100 transition-colors gap-0.5"
          title="Text Color (opens Style sidebar)"
          type="button"
        >
          <span className="text-lg font-semibold leading-none text-gray-700">A</span>
          <div
            className="w-5 h-1 rounded"
            style={{ backgroundColor: (block.data as any).color || '#000000' }}
          />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* List Buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => handleList('ul')}
            onMouseDown={(e) => e.preventDefault()}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            title="Bullet List"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
            </svg>
          </button>
          <button
            onClick={() => handleList('ol')}
            onMouseDown={(e) => e.preventDefault()}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            title="Numbered List"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment Buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => handleAlignment('left')}
            onMouseDown={(e) => e.preventDefault()}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            title="Align Left"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
            </svg>
          </button>
          <button
            onClick={() => handleAlignment('center')}
            onMouseDown={(e) => e.preventDefault()}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            title="Align Center"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
            </svg>
          </button>
          <button
            onClick={() => handleAlignment('right')}
            onMouseDown={(e) => e.preventDefault()}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            title="Align Right"
            type="button"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link Button */}
        <button
          onClick={handleLink}
          onMouseDown={(e) => e.preventDefault()}
          className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-700"
          title="Insert Link"
          type="button"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </button>

        {/* Spacer to push close button to right */}
        <div className="flex-1" />

        {/* Close Button */}
        <button
          onClick={() => clearEditingBlock()}
          onMouseDown={(e) => e.preventDefault()}
          className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          title="Close Toolbar (Esc)"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyLink()
                if (e.key === 'Escape') setShowLinkInput(false)
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                type="button"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for slide-down animation */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
