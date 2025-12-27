interface ColorControlProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorControl({
  label,
  value,
  onChange
}: ColorControlProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
      />
    </div>
  )
}
