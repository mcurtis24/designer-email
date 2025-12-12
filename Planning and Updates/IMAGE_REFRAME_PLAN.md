# Image Reframing Feature - Implementation Plan

## Overview
Add ability to double-click gallery images to adjust their position/focal point within the fixed crop area, similar to Canva's image reframing feature.

## User Flow

### Current Behavior
- Single click on image: Change image (file picker)
- Images are cropped to fixed dimensions with center focal point

### New Behavior
- **Single click**: Change image (unchanged)
- **Double click**: Enter reframe mode
  - Modal opens with larger preview
  - Image can be dragged/repositioned within crop box
  - Visual indicators show crop boundaries
  - Save/Cancel buttons to confirm or discard changes

## Technical Approach

### Approach A: CSS object-position (Recommended - Simpler)

#### Data Structure Changes

**File**: `src/types/email.ts`

Add `objectPosition` property to gallery images:

```typescript
export interface GalleryImage {
  src: string
  alt: string
  linkUrl?: string
  borderRadius?: number
  objectPosition?: string  // e.g., "50% 50%" (center), "20% 80%" (left-bottom)
}
```

#### Components to Create/Modify

**1. New Component: `ImageReframeModal.tsx`**

```typescript
interface ImageReframeModalProps {
  isOpen: boolean
  imageUrl: string
  currentPosition: string  // e.g., "50% 50%"
  aspectRatio: number      // width/height of crop box
  onSave: (position: string) => void
  onCancel: () => void
}
```

Features:
- Large preview area (500px x 500px or responsive)
- Fixed crop box overlay (shows final crop area)
- Draggable image underneath crop box
- Visual grid/guidelines
- Position preview text (e.g., "X: 45%, Y: 60%")
- Reset to center button
- Save/Cancel buttons

**2. Update: `SortableGalleryImage.tsx`**

Add double-click handler:
```typescript
const handleDoubleClick = (e: React.MouseEvent) => {
  if (isSelected && image.src) {
    e.stopPropagation()
    onReframe(index)  // New prop callback
  }
}
```

Apply object-position:
```typescript
<img
  src={image.src}
  alt={image.alt}
  className="w-full h-full object-cover"
  style={{
    objectPosition: image.objectPosition || '50% 50%',
    // ... other styles
  }}
  onDoubleClick={handleDoubleClick}
/>
```

**3. Update: `GalleryBlock.tsx`**

Add reframe state and modal:
```typescript
const [reframingIndex, setReframingIndex] = useState<number | null>(null)

const handleReframe = (index: number) => {
  setReframingIndex(index)
}

const handleSavePosition = (position: string) => {
  if (reframingIndex !== null) {
    const newImages = [...data.images]
    newImages[reframingIndex] = {
      ...newImages[reframingIndex],
      objectPosition: position
    }
    updateBlock(block.id, { data: { ...data, images: newImages } })
    setReframingIndex(null)
  }
}
```

**4. Update: `htmlGenerator.ts`**

Apply object-position in HTML export:
```typescript
const imageTag = `<img
  src="${image.src}"
  alt="${image.alt}"
  style="display: block; width: 100%; height: ${imageHeight}px;
         object-fit: cover; object-position: ${image.objectPosition || '50% 50%'};
         border: 0; ${borderRadiusStyle}"
/>`
```

### Email Client Compatibility

**object-position Support:**
- ✅ Gmail (web, iOS, Android)
- ✅ Apple Mail (macOS, iOS)
- ✅ Outlook.com / Office 365
- ⚠️ Outlook Desktop (Windows) - Limited support
- ✅ Yahoo Mail
- ✅ Thunderbird

**Fallback:** Images default to center (50% 50%) in unsupported clients.

---

### Approach B: background-image (Better Email Support - Future Enhancement)

If Approach A doesn't work well in email clients, use background-image method:

```html
<td style="width: 200px; height: 200px;">
  <div style="width: 100%; height: 100%;
              background-image: url('image.jpg');
              background-size: cover;
              background-position: 20% 80%;
              background-repeat: no-repeat;">
  </div>
</td>
```

**Pros:**
- Better email client support (background-position widely supported)
- More reliable rendering

**Cons:**
- More complex HTML structure
- Loses semantic img tag (impacts accessibility)
- Need to restructure current gallery HTML generation

---

## Implementation Steps

### Phase 1: Data Structure & Types (10 mins)
- [ ] Add `objectPosition?: string` to GalleryImage interface in `types/email.ts`
- [ ] Verify TypeScript compilation

### Phase 2: Reframe Modal Component (60 mins)
- [ ] Create `src/components/ui/ImageReframeModal.tsx`
- [ ] Implement draggable image with position calculation
- [ ] Add crop box overlay with visual guidelines
- [ ] Add position display and reset button
- [ ] Add Save/Cancel buttons
- [ ] Style with Tailwind (match project design)

### Phase 3: Gallery Component Updates (30 mins)
- [ ] Update `SortableGalleryImage.tsx`:
  - Add double-click handler
  - Apply object-position style
  - Add visual hint (tooltip on hover: "Double-click to reframe")
- [ ] Update `GalleryBlock.tsx`:
  - Add reframe state management
  - Add modal rendering
  - Add position save handler
  - Pass callbacks to child components

### Phase 4: HTML Export (20 mins)
- [ ] Update `htmlGenerator.ts` to include object-position in image styles
- [ ] Test in HTML preview modal

### Phase 5: Testing (40 mins)
- [ ] Test double-click activation
- [ ] Test drag interaction in reframe modal
- [ ] Test position persistence
- [ ] Test HTML export with various positions
- [ ] Test in email clients (Gmail, Outlook.com, Apple Mail)
- [ ] Test edge cases (images without position data, backwards compatibility)

**Total Time: ~2.5 hours**

---

## Reframe Modal Design

### Layout
```
┌─────────────────────────────────────────┐
│  Reframe Image                      ✕   │
├─────────────────────────────────────────┤
│                                         │
│   ┌───────────────────────────────┐    │
│   │                               │    │
│   │    [Draggable Image Area]     │    │
│   │                               │    │
│   │  ┌─────────────────────┐     │    │
│   │  │                     │     │    │
│   │  │   Fixed Crop Box    │     │    │
│   │  │   (Outlined)        │     │    │
│   │  │                     │     │    │
│   │  └─────────────────────┘     │    │
│   │                               │    │
│   └───────────────────────────────┘    │
│                                         │
│   Position: X: 45%, Y: 60%             │
│                                         │
│   [Reset to Center]   [Cancel] [Save]  │
└─────────────────────────────────────────┘
```

### Interaction Details

1. **Drag to Reposition**:
   - Click and drag anywhere on image
   - Image moves under fixed crop box
   - Real-time position updates
   - Constrain drag bounds (image can't leave crop area entirely)

2. **Visual Feedback**:
   - Crop box: Dashed white outline with shadow
   - Grid lines: Optional 3x3 rule of thirds grid
   - Dimmed area: Outside crop box slightly darkened
   - Cursor: Grab hand when hovering, grabbing when dragging

3. **Position Calculation**:
   - Convert pixel drag to percentage
   - Store as CSS object-position format: "X% Y%"
   - X: 0% (left) to 100% (right)
   - Y: 0% (top) to 100% (bottom)

---

## Code Snippets

### ImageReframeModal Core Logic

```typescript
const ImageReframeModal = ({ isOpen, imageUrl, currentPosition, onSave, onCancel }) => {
  const [position, setPosition] = useState(currentPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse position string to percentages
  const parsePosition = (pos: string) => {
    const [x, y] = pos.split(' ').map(v => parseFloat(v))
    return { x, y }
  }

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Clamp values
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    setPosition(`${clampedX.toFixed(1)}% ${clampedY.toFixed(1)}%`)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl">
        <h2>Reframe Image</h2>

        <div
          ref={containerRef}
          className="relative w-[500px] h-[500px] bg-gray-900 overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background image (draggable) */}
          <img
            src={imageUrl}
            className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
            style={{ objectPosition: position }}
            draggable={false}
          />

          {/* Fixed crop box overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-4 border-dashed border-white shadow-lg"
                 style={{ width: '280px', height: '280px' }}>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Position: {position}
        </div>

        <div className="mt-4 flex justify-between">
          <button onClick={() => setPosition('50% 50%')}>Reset to Center</button>
          <div>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={() => onSave(position)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## User Experience Enhancements

### Visual Hints
1. **Hover State**: Show "Double-click to reframe" tooltip on gallery images
2. **Cursor Change**: Change cursor to indicate draggability in reframe mode
3. **Animation**: Smooth transition when applying new position

### Accessibility
1. **Keyboard Support**: Arrow keys to nudge position in reframe modal
2. **Screen Reader**: Announce position changes
3. **Focus Management**: Trap focus in modal, return focus on close

### Mobile Considerations
1. **Touch Support**: Implement touch drag in reframe modal
2. **Gesture**: Pinch-to-zoom for fine adjustments (optional)
3. **Responsive Modal**: Scale crop box for smaller screens

---

## Testing Checklist

### Functional Testing
- [ ] Double-click opens reframe modal
- [ ] Single click still opens file picker
- [ ] Drag updates image position
- [ ] Position persists after save
- [ ] Cancel discards changes
- [ ] Reset centers image
- [ ] Works with all gallery layouts (2/3/4-col)
- [ ] Works with border radius
- [ ] Position saves to store correctly
- [ ] Position applies in canvas view
- [ ] Position exports to HTML correctly

### Email Client Testing
- [ ] Gmail web
- [ ] Gmail mobile (iOS/Android)
- [ ] Outlook.com
- [ ] Apple Mail (macOS)
- [ ] Apple Mail (iOS)
- [ ] Yahoo Mail
- [ ] Outlook Desktop (Windows) - check fallback

### Edge Cases
- [ ] Images without objectPosition (default to center)
- [ ] Existing galleries (backwards compatibility)
- [ ] Very wide/tall images
- [ ] Small images (smaller than crop box)
- [ ] Empty image slots (no double-click handler)
- [ ] Rapid double-clicks
- [ ] Modal open with block deselection

---

## Future Enhancements

1. **Zoom Control**: Allow zooming in/out within crop (scale adjustment)
2. **Presets**: Quick position presets (center, top-left, top-right, etc.)
3. **Automatic Smart Crop**: AI-detected focal point for faces
4. **Crop Shape**: Support for circular or custom shaped crops
5. **Filter/Adjust**: Brightness, contrast, saturation adjustments in modal

---

## Alternative: Simpler Quick Implementation

If full modal is too complex, start with a simpler version:

### Quick Version: Position Presets

Add 9 position buttons in sidebar when image is selected:

```
┌─────┬─────┬─────┐
│ TL  │  T  │ TR  │  Top-Left, Top-Center, Top-Right
├─────┼─────┼─────┤
│  L  │  C  │  R  │  Center-Left, Center, Center-Right
├─────┼─────┼─────┤
│ BL  │  B  │ BR  │  Bottom-Left, Bottom-Center, Bottom-Right
└─────┴─────┴─────┘
```

Maps to:
- TL: "0% 0%"
- T: "50% 0%"
- TR: "100% 0%"
- L: "0% 50%"
- C: "50% 50%"
- R: "100% 50%"
- BL: "0% 100%"
- B: "50% 100%"
- BR: "100% 100%"

**Pros**: Much simpler, faster to implement (~30 mins)
**Cons**: Less flexible, only 9 positions vs infinite

---

## Recommendation

**Start with Approach A (object-position)** as it's:
- Simpler to implement
- Works well in modern email clients
- Non-breaking (backwards compatible)
- Can be enhanced later with Approach B if needed

**Implement full modal** (not quick preset version) for:
- Better UX matching professional tools
- More control for users
- Learning opportunity for advanced React patterns

**Estimated total time: 2.5 hours** for full modal implementation

---

**Ready to implement?** Let me know if you want to proceed with this plan, or if you'd like any adjustments!
