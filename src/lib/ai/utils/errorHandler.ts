/**
 * AI Error Handler
 * Handles and formats AI service errors
 */

import type { AIServiceError } from '../types/ai'

/**
 * Convert error to AIServiceError
 */
export function toAIServiceError(error: any): AIServiceError {
  // Anthropic API errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          type: 'api_error',
          message: 'Invalid API key. Please check your Anthropic API key configuration.',
          details: error,
          retryable: false,
        }

      case 429:
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again in a moment.',
          details: error,
          retryable: true,
        }

      case 500:
      case 502:
      case 503:
        return {
          type: 'api_error',
          message: 'Anthropic API is temporarily unavailable. Please try again.',
          details: error,
          retryable: true,
        }

      default:
        return {
          type: 'api_error',
          message: `API error: ${error.message || 'Unknown error'}`,
          details: error,
          retryable: false,
        }
    }
  }

  // Network errors
  if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
    return {
      type: 'network_error',
      message: 'Network error. Please check your internet connection.',
      details: error,
      retryable: true,
    }
  }

  // Budget errors
  if (error.message?.includes('budget')) {
    return {
      type: 'budget_exceeded',
      message: 'Daily budget exceeded. AI features will be available tomorrow.',
      details: error,
      retryable: false,
    }
  }

  // Invalid response errors
  if (error.message?.includes('JSON') || error.message?.includes('parse')) {
    return {
      type: 'invalid_response',
      message: 'Received invalid response from AI. Please try again.',
      details: error,
      retryable: true,
    }
  }

  // Generic error
  return {
    type: 'api_error',
    message: error.message || 'An unexpected error occurred.',
    details: error,
    retryable: false,
  }
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: AIServiceError): string {
  return error.message
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AIServiceError): boolean {
  return error.retryable === true
}

/**
 * Sleep utility for retry logic
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const aiError = toAIServiceError(error)

      // Don't retry if error is not retryable
      if (!isRetryableError(aiError)) {
        throw aiError
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, ...
      const delay = initialDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }

  throw toAIServiceError(lastError)
}
