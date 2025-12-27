/**
 * Generate Tab
 * AI-powered email generation from prompts
 */

import { useState } from 'react'
import {
  Wand2,
  Loader2,
  CheckCircle,
  FileText,
  Calendar,
  Megaphone,
  Bell,
  AlertTriangle,
  Gift,
  Heart,
  XCircle,
} from 'lucide-react'
import { useAI } from '@/lib/ai/AIContext'
import { EmailGenerator } from '@/lib/ai/services/EmailGenerator'
import type { TemplateType, AudienceType, ToneType } from '@/lib/ai/types/ai'
import toast from 'react-hot-toast'

const TEMPLATES = [
  {
    id: 'newsletter' as TemplateType,
    name: 'Newsletter',
    icon: FileText,
    description: 'Regular updates and news',
    example: 'Create a weekly newsletter about recent activities',
  },
  {
    id: 'event' as TemplateType,
    name: 'Event',
    icon: Calendar,
    description: 'Upcoming events and dates',
    example: 'Announce a fundraiser event on Friday evening',
  },
  {
    id: 'announcement' as TemplateType,
    name: 'Announcement',
    icon: Megaphone,
    description: 'Important updates',
    example: 'Share important policy updates',
  },
  {
    id: 'reminder' as TemplateType,
    name: 'Reminder',
    icon: Bell,
    description: 'Gentle reminders',
    example: 'Remind about upcoming deadline',
  },
  {
    id: 'emergency' as TemplateType,
    name: 'Emergency',
    icon: AlertTriangle,
    description: 'Urgent communications',
    example: 'School closure due to weather',
  },
  {
    id: 'promotion' as TemplateType,
    name: 'Promotion',
    icon: Gift,
    description: 'Sales and special offers',
    example: 'Announce a special discount or sale',
  },
  {
    id: 'welcome' as TemplateType,
    name: 'Welcome',
    icon: Heart,
    description: 'Welcome new members',
    example: 'Welcome new community members',
  },
]

export function GenerateTab() {
  const { isProcessing, setProcessing, addCost, applyBlocksToEditor, closeSidebar, dailyBudget, currentCost } =
    useAI()

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [prompt, setPrompt] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [audience, setAudience] = useState<AudienceType>('general')
  const [tone, setTone] = useState<ToneType>('professional')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template)
    setShowSuccess(false)
    setError(null)

    // Set example prompt for templates
    const templateData = TEMPLATES.find((t) => t.id === template)
    if (templateData && !prompt) {
      setPrompt(templateData.example)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    // Check budget
    if (currentCost >= dailyBudget) {
      toast.error('Daily budget exceeded. Try again tomorrow!')
      return
    }

    setError(null)
    setShowSuccess(false)
    setProcessing(true, 'generate')

    try {
      const generator = new EmailGenerator()

      const result = await generator.generateEmail(prompt.trim(), {
        schoolName: schoolName || undefined,
        audience,
        tone,
        templateType: selectedTemplate || undefined,
      })

      // Add cost
      addCost(result.cost)

      // Apply blocks to editor
      applyBlocksToEditor(result.blocks)

      // Show success
      setShowSuccess(true)
      toast.success(`Email generated! Cost: $${result.cost.toFixed(4)}`)

      // Close sidebar after a short delay
      setTimeout(() => {
        closeSidebar()
      }, 1500)
    } catch (err: any) {
      console.error('Generation error:', err)
      setError(err.message || 'Failed to generate email. Please try again.')
      toast.error(err.message || 'Failed to generate email')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Template Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Choose a template type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((template) => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{template.name}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Describe your email
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Create a newsletter about upcoming parent-teacher conferences on Friday, March 15th..."
          className="
            w-full px-3 py-2
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            text-sm
            resize-none
          "
          rows={4}
          disabled={isProcessing}
        />
      </div>

      {/* Context Fields */}
      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
            Organization name (optional)
          </label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Acme Corporation"
            className="
              w-full px-3 py-2
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              text-sm
            "
            disabled={isProcessing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
              Audience
            </label>
            <select
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as AudienceType)}
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                text-sm
              "
              disabled={isProcessing}
            >
              <option value="general">General</option>
              <option value="parents">Parents</option>
              <option value="staff">Staff</option>
              <option value="students">Students</option>
              <option value="community">Community</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneType)}
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                text-sm
              "
              disabled={isProcessing}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-700">
            Email generated successfully! Check the canvas.
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isProcessing || !prompt.trim() || currentCost >= dailyBudget}
        className="
          w-full py-3 px-4
          bg-purple-600 hover:bg-purple-700
          disabled:bg-gray-300 disabled:cursor-not-allowed
          text-white font-medium
          rounded-lg
          transition-colors
          flex items-center justify-center gap-2
        "
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Generate Email</span>
          </>
        )}
      </button>

      {/* Tip */}
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Be specific about dates, details, and desired sections for best results
      </div>
    </div>
  )
}
