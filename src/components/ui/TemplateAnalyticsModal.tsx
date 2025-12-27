import { UserTemplate } from '../../types/email'
import {
  calculateTemplateAnalytics,
  formatNumber,
  getRelativeTime,
} from '../../lib/analytics/templateAnalytics'

interface TemplateAnalyticsModalProps {
  templates: UserTemplate[]
  onClose: () => void
}

export default function TemplateAnalyticsModal({
  templates,
  onClose,
}: TemplateAnalyticsModalProps) {
  const analytics = calculateTemplateAnalytics(templates)

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Template Analytics</h2>
            <p className="text-sm text-gray-600 mt-1">
              Insights about your template library
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close analytics"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Templates"
              value={analytics.totalTemplates.toString()}
              icon="📚"
            />
            <StatCard
              label="Total Loads"
              value={analytics.totalLoads.toString()}
              icon="🔄"
            />
            <StatCard
              label="Avg. Usage"
              value={formatNumber(analytics.averageUsagePerTemplate, 1)}
              icon="📊"
            />
            <StatCard
              label="Created (30d)"
              value={analytics.templatesCreatedLast30Days.toString()}
              icon="✨"
            />
          </div>

          {/* Top Templates */}
          {analytics.topTemplates.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top 5 Most-Used Templates
              </h3>
              <div className="space-y-2">
                {analytics.topTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {template.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {template.category} • Last used {getRelativeTime(template.lastUsedAt || template.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {template.useCount}
                      </p>
                      <p className="text-xs text-gray-500">uses</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most vs Least Used */}
          {analytics.mostUsedTemplate && analytics.leastUsedTemplate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Used */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-800 mb-2">
                  🏆 Most Used Template
                </h3>
                <p className="font-medium text-gray-900 truncate">
                  {analytics.mostUsedTemplate.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {analytics.mostUsedTemplate.useCount} uses • {analytics.mostUsedTemplate.category}
                </p>
              </div>

              {/* Least Used */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">
                  💤 Least Used Template
                </h3>
                <p className="font-medium text-gray-900 truncate">
                  {analytics.leastUsedTemplate.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {analytics.leastUsedTemplate.useCount} uses • {analytics.leastUsedTemplate.category}
                </p>
              </div>
            </div>
          )}

          {/* Category Distribution */}
          {analytics.categoryDistribution.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Templates by Category
              </h3>
              <div className="space-y-3">
                {analytics.categoryDistribution.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creation Trend */}
          {analytics.creationTrend.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Template Creation (Last 30 Days)
              </h3>
              <div className="space-y-2">
                {analytics.creationTrend.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No templates created in the last 30 days
                  </p>
                ) : (
                  <div className="flex items-end justify-between gap-2 h-32">
                    {analytics.creationTrend.map((item) => {
                      const maxCount = Math.max(
                        ...analytics.creationTrend.map((t) => t.count)
                      )
                      const heightPercent = (item.count / maxCount) * 100

                      return (
                        <div
                          key={item.date}
                          className="flex-1 flex flex-col items-center gap-1 group"
                        >
                          <div className="relative w-full">
                            <div
                              className="w-full bg-blue-500 rounded-t transition-all group-hover:bg-blue-600"
                              style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                            />
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                {item.count} {item.count === 1 ? 'template' : 'templates'}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 rotate-45 origin-left whitespace-nowrap">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Additional Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-medium text-gray-900">Total Version History</p>
                  <p className="text-sm text-gray-600">
                    {analytics.totalVersions} saved versions across all templates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-medium text-gray-900">Growth Rate</p>
                  <p className="text-sm text-gray-600">
                    {analytics.templatesCreatedLast30Days > 0
                      ? `${analytics.templatesCreatedLast30Days} templates in last 30 days`
                      : 'No recent template creation'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: string
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}
