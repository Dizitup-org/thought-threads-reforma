# Media Files Directory Structure

## Organization

This project organizes media files in the following structure:

```
/public
  /videos     - MP4 video files
  /gifs       - Animated GIF files
  /images     - Static image files
```

## Adding Media Files

### Videos
Place MP4 video files in the `/public/videos` directory:
- Example: `/public/videos/hero-background.mp4`
- Reference in code: `videoSrc="/videos/hero-background.mp4"`

### GIFs
Place animated GIF files in the `/public/gifs` directory:
- Example: `/public/gifs/hero-animation.gif`
- Reference in code: `gifSrc="/gifs/hero-animation.gif"`

### Images
Place static image files in the `/public/images` directory:
- Example: `/public/images/hero-image.jpg`
- Reference in code: `imageSrc="/images/hero-image.jpg"`

## Usage in VideoBackground Component

The `VideoBackground` component supports all three media types:

```jsx
// Video background
<VideoBackground videoSrc="/videos/hero-background.mp4" />

// GIF background
<VideoBackground gifSrc="/gifs/hero-animation.gif" />

// Static image background
<VideoBackground imageSrc="/images/hero-image.jpg" />
```

## Optimization Tips

1. **Videos**: Use MP4 format with H.264 codec for best compatibility
2. **GIFs**: Keep file sizes under 5MB for optimal loading
3. **Images**: Use WebP or JPEG format with appropriate compression

## File Naming Convention

Use descriptive, lowercase filenames with hyphens:
- ✅ `hero-background.mp4`
- ✅ `product-showcase.gif`
- ❌ `Hero Background.MP4`
- ❌ `productShowcase.GIF`