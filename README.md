# Portfolio Website

Simple portfolio site built with HTML, CSS, and JavaScript.

## Run

- Open `index.html` in a browser, or
- Use a local server:
  - `python3 -m http.server 8000`
  - Visit `http://localhost:8000`

## Edit

- Update content in `index.html`
- Styles live in `styles.css`
- Scripts live in `script.js`

## Files

```
.
├── index.html
├── styles.css
├── script.js
└── media/
```

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

