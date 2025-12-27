/**
 * Chat Tab
 * AI conversation interface (Coming Soon)
 */

import { MessageSquare, Sparkles } from 'lucide-react'

export function ChatTab() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-purple-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Chat Assistant</h3>

      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        Chat with AI to create and modify your emails through natural conversation. Ask for
        changes, additions, or complete redesigns.
      </p>

      <div className="space-y-2 w-full max-w-sm">
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>"Add a red button that says Register"</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>"Make the heading larger and bold"</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>"Change the layout to 2 columns"</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>"Add a footer with contact info"</span>
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
