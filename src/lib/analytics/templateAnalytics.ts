import { UserTemplate } from '../../types/email'

export interface TemplateAnalytics {
  totalTemplates: number
  totalLoads: number
  mostUsedTemplate: UserTemplate | null
  leastUsedTemplate: UserTemplate | null
  categoryDistribution: { category: string; count: number; percentage: number }[]
  creationTrend: { date: string; count: number }[]
  topTemplates: UserTemplate[]
  averageUsagePerTemplate: number
  templatesCreatedLast30Days: number
  totalVersions: number
}

/**
 * Calculate comprehensive analytics for user templates
 */
export function calculateTemplateAnalytics(templates: UserTemplate[]): TemplateAnalytics {
  if (templates.length === 0) {
    return {
      totalTemplates: 0,
      totalLoads: 0,
      mostUsedTemplate: null,
      leastUsedTemplate: null,
      categoryDistribution: [],
      creationTrend: [],
      topTemplates: [],
      averageUsagePerTemplate: 0,
      templatesCreatedLast30Days: 0,
      totalVersions: 0,
    }
  }

  // Total templates
  const totalTemplates = templates.length

  // Total loads (sum of all useCount)
  const totalLoads = templates.reduce((sum, t) => sum + (t.useCount || 0), 0)

  // Average usage per template
  const averageUsagePerTemplate = totalTemplates > 0 ? totalLoads / totalTemplates : 0

  // Most used template
  const mostUsedTemplate = templates.reduce((max, t) => {
    return (t.useCount || 0) > (max.useCount || 0) ? t : max
  }, templates[0])

  // Least used template
  const leastUsedTemplate = templates.reduce((min, t) => {
    return (t.useCount || 0) < (min.useCount || 0) ? t : min
  }, templates[0])

  // Top 5 most-used templates
  const topTemplates = [...templates]
    .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
    .slice(0, 5)

  // Category distribution
  const categoryMap = new Map<string, number>()
  templates.forEach((t) => {
    const category = t.category || 'Uncategorized'
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })

  const categoryDistribution = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / totalTemplates) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  // Creation trend (last 30 days, grouped by day)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const creationMap = new Map<string, number>()
  templates.forEach((t) => {
    const createdDate = new Date(t.createdAt)
    if (createdDate >= thirtyDaysAgo) {
      const dateKey = createdDate.toISOString().split('T')[0] // YYYY-MM-DD
      creationMap.set(dateKey, (creationMap.get(dateKey) || 0) + 1)
    }
  })

  const creationTrend = Array.from(creationMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Templates created in last 30 days
  const templatesCreatedLast30Days = templates.filter((t) => {
    return new Date(t.createdAt) >= thirtyDaysAgo
  }).length

  // Total versions across all templates
  const totalVersions = templates.reduce((sum, t) => {
    return sum + (t.versions?.length || 0)
  }, 0)

  return {
    totalTemplates,
    totalLoads,
    mostUsedTemplate,
    leastUsedTemplate,
    categoryDistribution,
    creationTrend,
    topTemplates,
    averageUsagePerTemplate,
    templatesCreatedLast30Days,
    totalVersions,
  }
}

/**
 * Format a date for display in analytics
 */
export function formatAnalyticsDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Format a number for display in analytics
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K'
  }
  return num.toFixed(decimals)
}

/**
 * Get relative time string (e.g., "2 days ago", "1 week ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
