/**
 * Rich Text Toolbar
 * Provides comprehensive formatting controls for text blocks
 * Ported and enhanced from previous Designer Email version
 * Outputs email-safe HTML with inline styles only
 */

import { useState } from 'react'

interface RichTextToolbarProps {
  onFormat: (command: string, value?: string) => void
  activeStates?: {
    isBold?: boolean
    isItalic?: boolean
    isUnderline?: boolean
  }
}

export default function RichTextToolbar({ onFormat, activeStates = {} }: RichTextToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [textColor, setTextColor] = useState('#000000')

  const { isBold = false, isItalic = false, isUnderline = false } = activeStates

  const handleBold = () => {
    onFormat('bold')
  }

  const handleItalic = () => {
    onFormat('italic')
  }

  const handleUnderline = () => {
    onFormat('underline')
  }

  const handleAlignment = (alignment: string) => {
    onFormat('align', alignment)
  }

  const handleList = (type: 'ul' | 'ol') => {
    onFormat(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList')
  }

  const handleFontFamily = (fontFamily: string) => {
    onFormat('fontFamily', fontFamily)
    setShowFontPicker(false)
  }

  const handleLink = () => {
    setShowLinkInput(true)
  }

  const applyLink = () => {
    if (linkUrl.trim()) {
      onFormat('link', linkUrl)
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const handleColor = () => {
    setShowColorPicker(!showColorPicker)
  }

  const applyColor = (color: string) => {
    setTextColor(color)
    onFormat('color', color)
    setShowColorPicker(false)
  }

  const commonColors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7',
    '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
    '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00',
    '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2">
      {/* Bold Button */}
      <button
        onClick={handleBold}
        onMouseDown={(e) => e.preventDefault()}
        className={`p-2 rounded transition-colors ${
          isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Bold (Ctrl+B)"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      </button>

      {/* Italic Button */}
      <button
        onClick={handleItalic}
        onMouseDown={(e) => e.preventDefault()}
        className={`p-2 rounded transition-colors ${
          isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Italic (Ctrl+I)"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
        </svg>
      </button>

      {/* Underline Button */}
      <button
        onClick={handleUnderline}
        onMouseDown={(e) => e.preventDefault()}
        className={`p-2 rounded transition-colors ${
          isUnderline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Underline (Ctrl+U)"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300" />

      {/* Alignment Buttons */}
      <button
        onClick={() => handleAlignment('left')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Align Left"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
        </svg>
      </button>
      <button
        onClick={() => handleAlignment('center')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Align Center"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
        </svg>
      </button>
      <button
        onClick={() => handleAlignment('right')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Align Right"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300" />

      {/* List Buttons */}
      <button
        onClick={() => handleList('ul')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Bullet List"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
        </svg>
      </button>
      <button
        onClick={() => handleList('ol')}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Numbered List"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300" />

      {/* Font Family Picker */}
      <div className="relative">
        <button
          onClick={() => setShowFontPicker(!showFontPicker)}
          onMouseDown={(e) => e.preventDefault()}
          className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
          title="Font Family"
          type="button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>
          </svg>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>

        {/* Font Family Dropdown */}
        {showFontPicker && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[200px]">
            {[
              { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
              { name: 'Georgia', value: 'Georgia, Times, serif' },
              { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
              { name: 'Courier New', value: "'Courier New', Courier, monospace" },
              { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
              { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
              { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
              { name: 'Comic Sans MS', value: "'Comic Sans MS', cursive" },
            ].map((font) => (
              <button
                key={font.value}
                onClick={() => handleFontFamily(font.value)}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
                style={{ fontFamily: font.value }}
                type="button"
              >
                {font.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* Link Button */}
      <button
        onClick={handleLink}
        onMouseDown={(e) => e.preventDefault()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Insert Link"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      </button>

      {/* Color Button */}
      <div className="relative">
        <button
          onClick={handleColor}
          onMouseDown={(e) => e.preventDefault()}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Text Color"
          type="button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
            <circle cx="6.5" cy="11.5" r="1.5"/>
            <circle cx="9.5" cy="7.5" r="1.5"/>
            <circle cx="14.5" cy="7.5" r="1.5"/>
            <circle cx="17.5" cy="11.5" r="1.5"/>
          </svg>
        </button>

        {/* Color Picker Dropdown */}
        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50">
            <div className="grid grid-cols-10 gap-1 mb-2">
              {commonColors.map((color) => (
                <button
                  key={color}
                  onClick={() => applyColor(color)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  type="button"
                />
              ))}
            </div>
            <input
              type="color"
              value={textColor}
              onChange={(e) => applyColor(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        )}
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
    </div>
  )
}
