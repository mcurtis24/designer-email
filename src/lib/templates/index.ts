/**
 * Template Loader
 * Exports all email templates for the template library
 */

import type { Template as ModernTemplate, LegacyTemplate } from '@/types/template'
import welcomeEmail from './welcome-email.json'
import newsletter from './newsletter.json'
import promotion from './promotion.json'
import productLaunch from './product-launch.json'
import eventInvitation from './event-invitation.json'
import orderConfirmation from './order-confirmation.json'
import reEngagement from './re-engagement.json'
import simpleAnnouncement from './simple-announcement.json'

/**
 * Unified Template type that works with both legacy and modern formats
 */
export type Template = ModernTemplate | LegacyTemplate

/**
 * Helper to get template metadata (works with both formats)
 */
export function getTemplateMetadata(template: Template) {
  if ('metadata' in template) {
    // Modern template format
    return {
      id: template.metadata.id,
      name: template.metadata.name,
      category: template.metadata.category,
      description: template.metadata.description || '',
      thumbnail: template.metadata.thumbnail || '',
      tags: template.metadata.tags || [],
    }
  } else {
    // Legacy template format
    return {
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description || '',
      thumbnail: template.thumbnail || '',
      tags: template.tags || [],
    }
  }
}

// Export individual templates
export {
  welcomeEmail,
  newsletter,
  promotion,
  productLaunch,
  eventInvitation,
  orderConfirmation,
  reEngagement,
  simpleAnnouncement,
}

// Export array of all templates (can contain both formats)
export const templates: Template[] = [
  welcomeEmail as Template,
  newsletter as Template,
  promotion as Template,
  productLaunch as Template,
  eventInvitation as Template,
  orderConfirmation as Template,
  reEngagement as Template,
  simpleAnnouncement as Template,
]
