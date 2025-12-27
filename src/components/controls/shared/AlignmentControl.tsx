import * as React from 'react'

type Alignment = 'left' | 'center' | 'right' | 'justify'

interface AlignmentControlProps {
  label: string
  value: Alignment
  onChange: (alignment: Alignment) => void
  showJustify?: boolean
}

export function AlignmentControl({
  label,
  value,
  onChange,
  showJustify = false
}: AlignmentControlProps) {
  const alignments: { value: Alignment; icon: React.ReactElement; label: string }[] = [
    {
      value: 'left',
      label: 'Left',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      ),
    },
    {
      value: 'center',
      label: 'Center',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
        </svg>
      ),
    },
    {
      value: 'right',
      label: 'Right',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
        </svg>
      ),
    },
  ]

  if (showJustify) {
    alignments.push({
      value: 'justify',
      label: 'Justify',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    })
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
        {alignments.map((alignment) => (
          <button
            key={alignment.value}
            onClick={() => onChange(alignment.value)}
            type="button"
            className={`flex-1 h-8 flex items-center justify-center rounded transition-colors ${
              value === alignment.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={alignment.label}
            aria-label={`Align ${alignment.label.toLowerCase()}`}
          >
            {alignment.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
