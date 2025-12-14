/**
 * Deep cloning utilities
 * Provides structuredClone with fallback for older environments
 */

/**
 * Deep clone an object using native structuredClone or fallback
 *
 * IMPORTANT: This replaces all usage of JSON.parse(JSON.stringify())
 * which fails with Date objects, undefined values, and other non-JSON types.
 *
 * @param value - The value to clone
 * @returns A deep clone of the value
 */
export function deepClone<T>(value: T): T {
  // Use native structuredClone if available (Node 17+, modern browsers)
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }

  // Fallback for older environments
  return fallbackClone(value)
}

/**
 * Fallback clone implementation for environments without structuredClone
 */
function fallbackClone<T>(value: T): T {
  // Handle primitives and null
  if (value === null || typeof value !== 'object') {
    return value
  }

  // Handle Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  // Handle Array
  if (Array.isArray(value)) {
    return value.map((item) => fallbackClone(item)) as T
  }

  // Handle Object
  if (value.constructor === Object) {
    const cloned: any = {}
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        cloned[key] = fallbackClone(value[key])
      }
    }
    return cloned as T
  }

  // For other object types, attempt JSON clone (best effort)
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    // If all else fails, return the value as-is
    console.warn('Unable to clone object, returning original reference:', value)
    return value
  }
}
