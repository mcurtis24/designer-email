/**
 * Token Counter Utility
 * Estimates token usage for Claude API calls
 */

/**
 * Rough estimation: 1 token ≈ 4 characters for English text
 * This is a conservative estimate. Actual token count may vary.
 * For production, use the official tokenizer from Anthropic.
 */
export function estimateTokens(text: string): number {
  // Remove extra whitespace
  const cleaned = text.trim().replace(/\s+/g, ' ')

  // Rough estimation: 1 token per 4 characters
  const charCount = cleaned.length
  const estimatedTokens = Math.ceil(charCount / 4)

  return estimatedTokens
}

/**
 * Estimate tokens for JSON structures
 */
export function estimateJSONTokens(obj: any): number {
  const jsonString = JSON.stringify(obj)
  return estimateTokens(jsonString)
}

/**
 * Estimate tokens for an array of messages
 */
export function estimateMessagesTokens(messages: Array<{ role: string; content: string }>): number {
  let total = 0

  for (const message of messages) {
    // Add tokens for role
    total += 1
    // Add tokens for content
    total += estimateTokens(message.content)
    // Add overhead for message structure
    total += 4
  }

  return total
}
