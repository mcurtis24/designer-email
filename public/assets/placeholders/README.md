# Placeholder Images

This directory is designated for self-hosted placeholder images used in email templates.

## Current Implementation

Currently, the application uses **Lorem Picsum** with seeds for consistent, reliable placeholder images. This approach was chosen for several reasons:

1. **Consistency**: Seed-based URLs ensure the same image appears on every reload
2. **Reliability**: No rate limits or API deprecation concerns
3. **Flexibility**: Easy to change image dimensions as needed
4. **Zero dependencies**: No need to manage image files in the repository

## Placeholder Configuration

Placeholder images are configured in `src/lib/placeholderImages.ts`:

```typescript
import { PLACEHOLDER_IMAGES, getPlaceholderImage } from '@/lib/placeholderImages'

// Get a specific placeholder
const heroImage = getPlaceholderImage('newsletter', 'hero')
// Returns: https://picsum.photos/seed/newsletter-hero/1200/600
```

## Available Categories

- **newsletter**: Editorial/content images
- **promotion**: Product/ecommerce images
- **event**: Conference/meeting images
- **welcome**: Onboarding/greeting images
- **product**: Product shots
- **order**: Transaction/receipt related
- **reengagement**: Win-back imagery
- **announcement**: General business images

## Future: Self-Hosted Images

If you want to add self-hosted placeholder images:

1. Add image files to this directory (e.g., `newsletter-hero.jpg`)
2. Update `src/lib/placeholderImages.ts` to reference local paths:
   ```typescript
   newsletter: {
     hero: '/assets/placeholders/newsletter-hero.jpg',
     // ...
   }
   ```
3. Ensure images are optimized:
   - Max width: 1200px for hero images
   - Max width: 800px for product/feature images
   - Format: WebP or JPEG
   - Compression: 80-85% quality

## Recommended Dimensions

- **Hero images**: 1200x600px (2:1 ratio)
- **Featured/Article images**: 800x500px (16:10 ratio)
- **Product images**: 800x800px (1:1 ratio)
- **Thumbnails**: 400x400px (1:1 ratio)

## Why Not Unsplash?

The Unsplash Source API was deprecated in 2022, making it unreliable for production use. Lorem Picsum is actively maintained and has better uptime.

## Performance Considerations

- Lorem Picsum images are served from CDN (fast)
- Images are cached by browsers
- Consistent URLs enable effective browser caching
- No CORS issues since images are from external source

## Cloudinary Integration

For production, consider using Cloudinary transformations:
- Automatic format optimization (WebP)
- Responsive image sizing
- Lazy loading support
- Better performance than Lorem Picsum

Example Cloudinary URL:
```
https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_800,h_600,c_fill/placeholder_marketing.jpg
```
