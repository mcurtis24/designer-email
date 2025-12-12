/**
 * Validation Types
 * Types for the email validation engine
 */

export type ValidationSeverity = 'error' | 'warning' | 'info'
export type ValidationCategory = 'accessibility' | 'content' | 'design' | 'deliverability'

export interface ValidationIssue {
  id: string
  ruleId: string
  severity: ValidationSeverity
  category: ValidationCategory
  message: string
  blockId?: string // ID of the block with the issue
  fix?: () => void // Optional auto-fix function
  helpText?: string // Additional help text
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: ValidationSeverity
  category: ValidationCategory
  check: (email: any) => ValidationIssue[]
}

export interface ValidationResult {
  issues: ValidationIssue[]
  errorCount: number
  warningCount: number
  infoCount: number
  isValid: boolean // True if no errors
}
