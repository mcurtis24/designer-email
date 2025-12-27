interface SizeControlProps {
  label: string
  value: string
  onChange: (size: string) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

export function SizeControl({
  label,
  value,
  onChange,
  min = 8,
  max = 72,
  step = 1,
  unit = 'px'
}: SizeControlProps) {
  // Extract numeric value from string like "24px"
  const numericValue = parseInt(value) || min

  const handleChange = (newValue: number) => {
    onChange(`${newValue}${unit}`)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleChange(Math.max(min, numericValue - step))}
          type="button"
          className="w-8 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          disabled={numericValue <= min}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <input
          type="number"
          value={numericValue}
          onChange={(e) => {
            const val = parseInt(e.target.value) || min
            handleChange(Math.min(max, Math.max(min, val)))
          }}
          min={min}
          max={max}
          step={step}
          className="flex-1 h-10 px-3 text-center rounded-md border border-gray-300 text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />

        <button
          onClick={() => handleChange(Math.min(max, numericValue + step))}
          type="button"
          className="w-8 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          disabled={numericValue >= max}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <span className="text-sm text-gray-500 font-medium min-w-[2rem]">{unit}</span>
      </div>
    </div>
  )
}
