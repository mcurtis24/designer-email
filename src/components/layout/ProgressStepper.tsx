export default function ProgressStepper() {
  const steps = [
    { number: 1, label: 'Email Details', status: 'completed' },
    { number: 2, label: 'Email Design', status: 'current' },
    { number: 3, label: 'Select Recipients', status: 'upcoming' },
    { number: 4, label: 'Preview & Test', status: 'upcoming' },
    { number: 5, label: 'Confirm & Send', status: 'upcoming' },
  ]

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    step.status === 'completed'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step.status === 'current'
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    step.status === 'completed' || step.status === 'current'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 -mt-10 mx-2">
                  <div
                    className={`h-full ${
                      step.status === 'completed' ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
