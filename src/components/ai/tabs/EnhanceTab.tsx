/**
 * Enhance Tab
 * AI-powered content enhancement (Coming Soon)
 */

import { PenLine, Sparkles } from 'lucide-react'

export function EnhanceTab() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <PenLine className="w-8 h-8 text-purple-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Enhancement</h3>

      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        Enhance your email content with AI-powered improvements. Fix grammar, adjust tone, simplify
        language, and more.
      </p>

      <div className="space-y-2 w-full max-w-sm">
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Grammar & spelling correction</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Tone adjustment</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Readability improvement</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Text expansion/shortening</span>
        </div>
      </div>

      <div className="mt-6 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          🚧 Coming soon! This feature is under development.
        </p>
      </div>
    </div>
  )
}
