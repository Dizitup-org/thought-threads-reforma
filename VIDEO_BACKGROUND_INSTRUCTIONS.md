# Video/GIF Background Implementation for Hero Section

## Overview
This implementation allows you to use videos, GIFs, or static images as backgrounds for your hero section while maintaining text visibility through customizable overlays.

## Component Usage

The `VideoBackground` component supports three types of media:

1. **Video Background** (Recommended for best performance)
2. **GIF Background** (For animated images)
3. **Static Image Background** (Fallback option)

## How to Implement

### 1. Using a Video Background

To use a video background, provide the `videoSrc` prop:

```jsx
<VideoBackground 
  videoSrc="/path/to/your/video.mp4"
  overlayOpacity={0.6}
>
  {/* Your content here */}
</VideoBackground>
```

### 2. Using a GIF Background

To use a GIF background, provide the `gifSrc` prop:

```jsx
<VideoBackground 
  gifSrc="/path/to/your/animation.gif"
  overlayOpacity={0.5}
>
  {/* Your content here */}
</VideoBackground>
```

### 3. Using a Static Image Background

To use a static image background, provide the `imageSrc` prop:

```jsx
<VideoBackground 
  imageSrc="/path/to/your/image.jpg"
  overlayOpacity={0.6}
>
  {/* Your content here */}
</VideoBackground>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `videoSrc` | string | Path to MP4 video file | undefined |
| `gifSrc` | string | Path to GIF file | undefined |
| `imageSrc` | string | Path to static image file | undefined |
| `overlayOpacity` | number | Opacity of the overlay (0-1) | 0.5 |
| `overlayColor` | string | CSS color variable for overlay | "var(--cream-light)" |
| `children` | ReactNode | Content to display over the background | undefined |

## Performance Recommendations

1. **Videos**: Use MP4 format for best compatibility and performance
2. **GIFs**: Keep file size small to avoid loading issues
3. **Optimization**: Compress media files without sacrificing quality

## Adding Media Files

Place your media files in the `public` directory:
- Videos: `/public/videos/your-video.mp4`
- GIFs: `/public/images/your-animation.gif`
- Images: `/public/images/your-image.jpg`

Then reference them with:
- Videos: `videoSrc="/videos/your-video.mp4"`
- GIFs: `gifSrc="/images/your-animation.gif"`
- Images: `imageSrc="/images/your-image.jpg"`

## Example Implementation

```jsx
<VideoBackground 
  videoSrc="/videos/hero-background.mp4"
  overlayOpacity={0.6}
>
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Your content */}
  </div>
</VideoBackground>
```

## Text Visibility

The overlay ensures your text remains readable. Adjust the `overlayOpacity` prop to control how prominent the overlay is:
- Higher values (0.7-0.9) = more opaque overlay
- Lower values (0.3-0.5) = more transparent overlay

## Browser Compatibility

The component uses modern HTML5 video features:
- `autoPlay`: Automatically plays the video
- `loop`: Loops the video continuously
- `muted`: Required for autoplay in most browsers
- `playsInline`: Prevents fullscreen playback on mobile

For browsers that don't support video, the component will fall back to GIF or static image if provided.