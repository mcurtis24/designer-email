/**
 * Category Card Component
 * Visual card with gradient background for block categories
 * Part of Canva-inspired UI redesign
 */

import { ReactNode } from 'react'

interface CategoryCardProps {
  category: string
  icon: ReactNode
  gradientFrom: string
  gradientTo: string
  count?: number
  onClick: () => void
}

export default function CategoryCard({
  category,
  icon,
  gradientFrom,
  gradientTo,
  count,
  onClick
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square rounded-xl p-4 flex flex-col items-center justify-center text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
      }}
    >
      {/* Icon */}
      <div className="text-white/90 mb-2">
        {icon}
      </div>

      {/* Category Name */}
      <span className="text-sm font-semibold text-white">
        {category}
      </span>

      {/* Count Badge (optional) */}
      {count !== undefined && (
        <span className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}
