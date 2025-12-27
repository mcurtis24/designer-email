/**
 * Social Icons Block Controls
 * Properties specific to social icons blocks
 */

import { useEmailStore } from '@/stores/emailStore'
import type { EmailBlock, SocialIconsBlockData } from '@/types/email'
import { AlignmentControl } from '@/components/controls/shared/AlignmentControl'
import { SizeControl } from '@/components/controls/shared/SizeControl'
import { ColorControl } from '@/components/controls/shared/ColorControl'

interface SocialIconsControlsProps {
  block: EmailBlock & { data: SocialIconsBlockData }
}

const iconStyleOptions = [
  { value: 'colored', label: 'Colored' },
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'circular', label: 'Circular' },
  { value: 'square', label: 'Square' },
]

export default function SocialIconsControls({ block }: SocialIconsControlsProps) {
  const updateBlock = useEmailStore((state) => state.updateBlock)
  const data = block.data as SocialIconsBlockData
  const socialLinks = useEmailStore((state) => state.email.settings.socialLinks) || []

  const handleDataChange = (field: keyof SocialIconsBlockData, value: any) => {
    updateBlock(block.id, {
      data: {
        ...data,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Info Message */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800 mb-2">
          <strong>💡 How Social Icons Work:</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
          <li>Social links are <strong>global</strong> - configured once, used everywhere</li>
          <li>Manage links in <strong>Footer block controls</strong></li>
          <li>This block lets you <strong>customize the styling</strong></li>
        </ul>
      </div>

      {/* Social Links Preview */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900">
            Active Social Links ({socialLinks.length})
          </label>
        </div>
        {socialLinks.length > 0 ? (
          <div className="space-y-1.5 text-xs text-gray-600">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-1.5 bg-white rounded">
                <span className="font-medium capitalize">{link.platform === 'x' ? 'X' : link.platform}:</span>
                <span className="text-gray-500 truncate flex-1">{link.url || '(empty)'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-gray-500 mb-2">
              No social links configured yet.
            </p>
            <p className="text-xs text-blue-600 font-medium">
              → Add them in Footer block controls first
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Styling Options</h3>

        {/* Icon Style */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Icon Style
          </label>
        <div className="grid grid-cols-3 gap-2">
          {iconStyleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDataChange('iconStyle', option.value)}
              className={`px-2 py-1.5 text-xs border rounded-md transition-colors ${
                data.iconStyle === option.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

        {/* Icon Color (for monochrome and outlined styles) */}
        {(data.iconStyle === 'monochrome' || data.iconStyle === 'outlined') && (
          <ColorControl
            label="Icon Color"
            value={data.iconColor || '#666666'}
            onChange={(color) => handleDataChange('iconColor', color)}
          />
        )}

        {/* Icon Size */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Icon Size
          </label>
        <div className="grid grid-cols-4 gap-2">
          {[24, 32, 40, 48].map((size) => (
            <button
              key={size}
              onClick={() => handleDataChange('iconSize', size)}
              className={`px-2 py-1.5 text-xs border rounded-md transition-colors ${
                data.iconSize === size
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

        {/* Spacing */}
        <SizeControl
          label="Spacing Between Icons"
          value={`${data.spacing}px`}
          onChange={(value) => handleDataChange('spacing', parseInt(value))}
          min={4}
          max={40}
          step={2}
          unit="px"
        />

        {/* Alignment */}
        <AlignmentControl
          label="Alignment"
          value={data.alignment}
          onChange={(alignment) => handleDataChange('alignment', alignment)}
        />
      </div>
    </div>
  )
}
