/**
 * Placeholder Image Configuration
 *
 * Uses Lorem Picsum with seeds for consistent, reliable placeholder images.
 * Seed ensures the same image appears on every reload.
 *
 * Categories:
 * - newsletter: Editorial/content images
 * - promotion: Product/ecommerce images
 * - event: Conference/meeting images
 * - welcome: Onboarding/greeting images
 * - product: Product shots
 * - order: Transaction/receipt related
 * - reengagement: Win-back imagery
 * - announcement: General business images
 */

export const PLACEHOLDER_IMAGES = {
  // Newsletter - Editorial content
  newsletter: {
    hero: 'https://picsum.photos/seed/newsletter-hero/1200/600',
    featured: 'https://picsum.photos/seed/newsletter-featured/800/500',
    article: 'https://picsum.photos/seed/newsletter-article/600/400',
  },

  // Promotional - Product imagery
  promotion: {
    hero: 'https://picsum.photos/seed/promo-hero/1200/600',
    product1: 'https://picsum.photos/seed/promo-product1/800/800',
    product2: 'https://picsum.photos/seed/promo-product2/800/800',
    product3: 'https://picsum.photos/seed/promo-product3/800/800',
    product4: 'https://picsum.photos/seed/promo-product4/800/800',
  },

  // Event/Webinar - Conference imagery
  event: {
    hero: 'https://picsum.photos/seed/event-hero/1200/600',
    speaker: 'https://picsum.photos/seed/event-speaker/400/400',
    venue: 'https://picsum.photos/seed/event-venue/800/500',
  },

  // Welcome - Onboarding imagery
  welcome: {
    hero: 'https://picsum.photos/seed/welcome-hero/1200/600',
    feature1: 'https://picsum.photos/seed/welcome-feature1/600/400',
    feature2: 'https://picsum.photos/seed/welcome-feature2/600/400',
  },

  // Product Launch - Product shots
  product: {
    hero: 'https://picsum.photos/seed/product-hero/1200/600',
    screenshot1: 'https://picsum.photos/seed/product-screen1/800/600',
    screenshot2: 'https://picsum.photos/seed/product-screen2/800/600',
  },

  // Order Confirmation - Transaction imagery
  order: {
    product1: 'https://picsum.photos/seed/order-product1/400/400',
    product2: 'https://picsum.photos/seed/order-product2/400/400',
  },

  // Re-engagement - Win-back imagery
  reengagement: {
    hero: 'https://picsum.photos/seed/reengagement-hero/1200/600',
    feature1: 'https://picsum.photos/seed/reengagement-1/600/400',
    feature2: 'https://picsum.photos/seed/reengagement-2/600/400',
  },

  // Announcement - General business
  announcement: {
    hero: 'https://picsum.photos/seed/announcement-hero/1200/600',
    illustration: 'https://picsum.photos/seed/announcement-ill/800/500',
  },
} as const

/**
 * Get a placeholder image URL by category and type
 * @param category Template category (newsletter, promotion, etc.)
 * @param type Image type (hero, product1, etc.)
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(
  category: keyof typeof PLACEHOLDER_IMAGES,
  type: string
): string {
  const categoryImages = PLACEHOLDER_IMAGES[category]
  if (!categoryImages) {
    console.warn(`Unknown placeholder category: ${category}`)
    return 'https://picsum.photos/seed/default/800/600'
  }

  const imageUrl = categoryImages[type as keyof typeof categoryImages]
  if (!imageUrl) {
    console.warn(`Unknown placeholder type "${type}" for category "${category}"`)
    return 'https://picsum.photos/seed/default/800/600'
  }

  return imageUrl
}

/**
 * Generic placeholder for any size
 * @param width Image width
 * @param height Image height
 * @param seed Optional seed for consistency
 * @returns Placeholder image URL
 */
export function getGenericPlaceholder(
  width: number,
  height: number,
  seed: string = 'generic'
): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}
