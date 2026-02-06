# Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript.

## Features

- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Smooth Animations**: Fade-in effects and smooth scrolling
- **Interactive Navigation**: Sticky navbar with active section highlighting
- **Multiple Sections**: Hero, About, Projects, Skills, and Contact
- **Mobile Menu**: Hamburger menu for mobile devices
- **Contact Form**: Ready-to-customize contact form
- **Live Code Animation**: Animated code editor in the About section that types code in real-time
- **Interactive Video Background**: Dynamic canvas animation with particles, neural networks, and floating code snippets in the hero section
- **Mouse-Interactive Elements**: Background particles respond to mouse movement for an engaging experience

## Getting Started

1. **Open the website**: Simply open `index.html` in your web browser
   ```bash
   # Or use a local server (recommended)
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Customize the content**:
   - Update your name, role, and description in `index.html`
   - Replace placeholder project information with your actual projects
   - Update contact information (email, LinkedIn, GitHub)
   - Modify skill levels and technologies to match your expertise
   - Add your own images or replace the placeholder graphics

3. **Customize the styling**:
   - Edit CSS variables in `styles.css` to change color scheme
   - Modify fonts, spacing, and other design elements

## Project Structure

```
.
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Interactive functionality
└── README.md       # This file
```

## Customization Guide

### Changing Colors
Edit the CSS variables at the top of `styles.css`:
```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #8b5cf6;    /* Secondary color */
    --text-primary: #1f2937;       /* Main text color */
    /* ... */
}
```

### Adding Projects
Add new project cards in the projects section:
```html
<div class="project-card">
    <div class="project-image">
        <div class="project-placeholder">Your Project</div>
    </div>
    <div class="project-content">
        <h3 class="project-title">Project Name</h3>
        <p class="project-description">Description here</p>
        <!-- ... -->
    </div>
</div>
```

### Updating Skills
Modify skill items and their progress percentages in the skills section.

### Customizing the Code Animation
The About section features a live code typing animation that automatically plays when the section comes into view. To customize it:

1. **Edit the code content** in `script.js`:
   ```javascript
   const codeLines = [
       '<span class="keyword">const</span> <span class="variable">developer</span> ...',
       // Add or modify lines here
   ];
   ```

2. **Customize syntax highlighting colors** in `styles.css` by modifying:
   - `.code-content .keyword` - JavaScript keywords
   - `.code-content .function` - Function names
   - `.code-content .string` - String literals
   - `.code-content .comment` - Comments
   - `.code-content .variable` - Variable names

3. **Adjust typing speed** by changing the timeout values in the `startTyping()` function.

### Adding a Video Background to Hero Section
The hero section supports both a canvas animation (default) and an optional video background. To add your own video:

1. **Prepare your video**:
   - Resolution: `1920x1080px` (16:9 aspect ratio)
   - Format: MP4 (H.264 codec recommended)
   - Duration: 10-30 seconds (looping)
   - File size: Keep under 2MB for best performance
   - Content: Abstract patterns, code typing, neural networks, or tech-related visuals

2. **Add the video file**:
   - Create an `assets` folder in your project root
   - Place your video file there (e.g., `assets/hero-background.mp4`)

3. **Update HTML**:
   - In `index.html`, find the `<video>` element in the hero section
   - Uncomment the `<source>` tag and update the path:
   ```html
   <video id="hero-video" class="hero-video" autoplay muted loop playsinline>
       <source src="assets/hero-background.mp4" type="video/mp4">
   </video>
   ```

4. **Video will automatically**:
   - Play as background when loaded
   - Loop continuously
   - Fade in smoothly
   - Canvas animation will reduce opacity (but remain as enhancement)

5. **Customize video opacity** in `styles.css`:
   ```css
   .hero-video.loaded {
       opacity: 0.9; /* Adjust between 0.5-1.0 */
   }
   ```

### Customizing the Interactive Canvas Background
The hero section features an interactive canvas animation that includes:

- **Particles**: 80 glowing particles that move and connect
- **Neural Network Pattern**: Subtle animated neural network visualization
- **Floating Code Snippets**: Python/ML code snippets floating across screen
- **Mouse Interaction**: Particles respond to mouse movement

To customize:

1. **Adjust particle count** in `script.js`:
   ```javascript
   const config = {
       particleCount: 80,  // Increase/decrease particles
       connectionDistance: 150,  // Max distance for connections
       particleSpeed: 0.5,  // Movement speed
   };
   ```

2. **Change colors** in the `config.colors` object to match your theme

3. **Modify code snippets** by editing the `CodeSnippet` class `texts` array

## Media Guidelines & Dimensions

When adding images, videos, and other media to your portfolio, follow these recommended dimensions for optimal performance and visual quality:

### Hero Section Images
- **Profile Photo/Avatar**: 
  - Recommended: `400x400px` to `600x600px`
  - Format: PNG, JPG, or WebP
  - Shape: Square or circular (will be displayed in a circular frame)
  - File size: Keep under 200KB for fast loading
  - Aspect ratio: 1:1 (square)

### Project Images
- **Project Screenshots/Thumbnails**:
  - Recommended: `1200x800px` (landscape) or `800x1200px` (portrait)
  - Minimum: `800x600px`
  - Format: JPG (for photos), PNG (for screenshots with text), or WebP
  - File size: Keep under 300KB per image
  - Aspect ratio: 3:2 or 16:9 for landscape, 4:3 for portrait
  - The CSS automatically crops these to `height: 200px` in project cards

### Background Images
- **Full-width backgrounds**:
  - Recommended: `1920x1080px` (Full HD)
  - Minimum: `1280x720px`, Higher resolution: `2560x1440px` (for Retina displays)
  - Format: JPG (smaller file size) or WebP
  - File size: Keep under 500KB
  - Aspect ratio: 16:9
  - Use optimized images with compression

- **Section backgrounds**:
  - Recommended: `1600x900px`
  - Format: JPG or WebP
  - File size: Keep under 400KB

### Videos
- **Video dimensions**:
  - Recommended: `1920x1080px` (16:9 aspect ratio)
  - Alternative: `1280x720px` (HD)
  - Format: MP4 (H.264 codec for best browser compatibility)
  - File size: Keep under 5MB for short clips, compress longer videos
  - Duration: 15-30 seconds for hero backgrounds, up to 2 minutes for project demos
  - Frame rate: 24fps or 30fps

- **Background videos**:
  - Recommended: `1920x1080px`, MP4 format
  - Muted and looping
  - File size: Keep under 2MB if possible (use video compression)

### Skills/Icons
- **Technology logos/icons**:
  - Recommended: `64x64px` to `128x128px`
  - Format: SVG (preferred for scalability) or PNG with transparent background
  - File size: Under 50KB each

### About Section Images
- **Profile or workspace images**:
  - Recommended: `800x600px` to `1200x800px`
  - Format: JPG or WebP
  - File size: Keep under 250KB

### General Image Optimization Tips
1. **Use modern formats**: WebP offers better compression than JPG/PNG
2. **Compress images**: Use tools like TinyPNG, ImageOptim, or Squoosh before uploading
3. **Responsive images**: Consider using `srcset` for different screen sizes:
   ```html
   <img src="image-800w.jpg" 
        srcset="image-400w.jpg 400w, 
                image-800w.jpg 800w, 
                image-1200w.jpg 1200w"
        sizes="(max-width: 768px) 400px, 800px"
        alt="Description">
   ```
4. **Lazy loading**: Add `loading="lazy"` attribute to images below the fold
5. **Alt text**: Always include descriptive alt text for accessibility

### Video Optimization Tips
1. **Compression**: Use tools like HandBrake or FFmpeg to compress videos
2. **Multiple sources**: Provide fallback formats (WebM, MP4):
   ```html
   <video>
     <source src="video.webm" type="video/webm">
     <source src="video.mp4" type="video/mp4">
   </video>
   ```
3. **Poster image**: Include a poster image for videos (same dimensions as video)
4. **Autoplay**: Only use autoplay for muted videos
5. **Lazy loading**: Load videos only when needed

### Image Dimensions Reference Table

| Use Case | Width | Height | Aspect Ratio | Format | Max Size |
|----------|-------|--------|--------------|--------|----------|
| Hero profile | 400-600px | 400-600px | 1:1 | PNG/JPG | 200KB |
| Project thumbnails | 1200px | 800px | 3:2 | JPG/PNG | 300KB |
| Background images | 1920px | 1080px | 16:9 | JPG/WebP | 500KB |
| Section backgrounds | 1600px | 900px | 16:9 | JPG/WebP | 400KB |
| Videos (background) | 1920px | 1080px | 16:9 | MP4 | 2MB |
| Project videos | 1920px | 1080px | 16:9 | MP4 | 5MB |
| Icons/logos | 64-128px | 64-128px | 1:1 | SVG/PNG | 50KB |
| About images | 800-1200px | 600-800px | 4:3 | JPG/WebP | 250KB |

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

Feel free to use this portfolio template for your personal website!

