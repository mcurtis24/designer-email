/**
 * Validation Engine
 * Main engine for validating email documents against all rules
 */

import type { ValidationResult, ValidationIssue, ValidationRule } from './types'
import { allRules } from './rules'

/**
 * Validate an email document against all rules
 */
export function validateEmail(email: any, rules: ValidationRule[] = allRules): ValidationResult {
  const allIssues: ValidationIssue[] = []

  // Run each validation rule
  rules.forEach(rule => {
    try {
      const issues = rule.check(email)
      allIssues.push(...issues)
    } catch (error) {
      console.error(`Error running validation rule ${rule.id}:`, error)
    }
  })

  // Count issues by severity
  const errorCount = allIssues.filter(issue => issue.severity === 'error').length
  const warningCount = allIssues.filter(issue => issue.severity === 'warning').length
  const infoCount = allIssues.filter(issue => issue.severity === 'info').length

  return {
    issues: allIssues,
    errorCount,
    warningCount,
    infoCount,
    isValid: errorCount === 0, // Email is valid if there are no errors
  }
}

/**
 * Get validation issues for a specific block
 */
export function getBlockIssues(
  validationResult: ValidationResult,
  blockId: string
): ValidationIssue[] {
  return validationResult.issues.filter(issue => issue.blockId === blockId)
}

/**
 * Get validation issues by category
 */
export function getIssuesByCategory(
  validationResult: ValidationResult,
  category: 'accessibility' | 'content' | 'design' | 'deliverability'
): ValidationIssue[] {
  return validationResult.issues.filter(issue => issue.category === category)
}

/**
 * Get validation issues by severity
 */
export function getIssuesBySeverity(
  validationResult: ValidationResult,
  severity: 'error' | 'warning' | 'info'
): ValidationIssue[] {
  return validationResult.issues.filter(issue => issue.severity === severity)
}

/**
 * Check if email has any critical issues (errors)
 */
export function hasCriticalIssues(validationResult: ValidationResult): boolean {
  return validationResult.errorCount > 0
}

/**
 * Get validation summary text
 */
export function getValidationSummary(validationResult: ValidationResult): string {
  const { errorCount, warningCount, infoCount } = validationResult

  if (errorCount === 0 && warningCount === 0 && infoCount === 0) {
    return 'No issues found'
  }

  const parts: string[] = []
  if (errorCount > 0) parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`)
  if (warningCount > 0) parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`)
  if (infoCount > 0) parts.push(`${infoCount} suggestion${infoCount !== 1 ? 's' : ''}`)

  return parts.join(', ')
}
