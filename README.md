# Dee Portfolio & Blog Platform

A fully responsive personal portfolio website with an integrated Firebase-powered blog admin panel. Features a modern admin dashboard for content management, Firebase Storage media uploads, scheduled post publishing, and a public blog with modal post views.

## 🚀 Tech Stack

### Frontend
- **HTML5 + CSS3** – Semantic markup with modern responsive design
- **Vanilla JavaScript** – Zero framework dependencies for maximum performance
- **Firebase SDK** – Authentication, Realtime Database, Storage integration

### Backend
- **Node.js + Express** – Optional upload proxy server (for Firebase Storage)
- **Firebase Admin SDK** – Server-side Firebase operations
- **Multer** – File upload handling

### Services
- **Firebase Authentication** – Email/password & GitHub OAuth
- **Firebase Realtime Database** – Blog post storage and retrieval
- **Cloudinary** – Media file hosting for images and videos

## 📁 Project Structure

```
dee/
├── index.html              # Main portfolio page
├── blog.html               # Public blog with post cards and modal viewer
├── admin.html              # Admin dashboard (requires auth)
├── styles.css              # Global styles (1200+ lines)
├── script.js               # Portfolio animations and interactions
├── blogscript.js           # Blog data loading from Firebase
├── adminscript.js          # Admin panel logic (auth, CRUD, uploads)
├── server.js               # Optional Node.js upload proxy
├── package.json            # Node dependencies for upload server
├── package-lock.json       # Locked dependency versions
├── serviceAccountKey.json  # Firebase Admin credentials (gitignored)
├── firebase-config.example.js # Firebase web config template
├── cors.json               # Firebase Storage CORS configuration
├── media/                  # Images, videos, icons, favicon
└── docs/                   # Project documentation
  ├── README_ADMIN.md
  ├── ADMIN_IMPROVEMENTS.md
  ├── ADMIN_QUICK_START.md
  ├── FIREBASE_SETUP.md
  ├── FIREBASE_CONFIG_LOCATION.md
  └── SYSTEM_CSS_DESIGN.md
```

## ✨ Features

### Portfolio Site
- **Hero Section** – Animated background video with profile overlay
- **About Section** – Bio, stats, and animated code editor
- **Projects Carousel** – Horizontal slider with media support (images/videos)
- **Skills Grid** – Progress bars and technology badges
- **Contact Section** – Direct links to email, GitHub, LinkedIn
- **Responsive Design** – Mobile-first approach with hamburger navigation

### Blog System
- **Post Cards** – Grid layout with featured images/videos
- **Category Filtering** – Filter posts by category or view all
- **Tag Cloud** – Visual tag navigation
- **Post Modal** – Full-screen overlay for reading complete posts
- **Inline Code Markup** – Render `` `code` `` in titles and excerpts
- **Media Support** – Display images or videos (15-30s clips)
- **Firebase Integration** – Real-time post loading from database

### Admin Panel
- **Secure Authentication** – Email/password and GitHub OAuth with Firebase Auth
- **Post Composer** – Rich form with live preview
- **Media Upload** – Cloudinary integration for images/videos
- **Scheduled Publishing** – Set future publish dates
- **Post Management** – Edit, delete, search, and filter posts
- **Status Tracking** – Published, scheduled, or draft states
- **Category & Tags** – Multiple tag support with visual chips
- **Responsive Layout** – Works on desktop and mobile
- **Real-time Preview** – See how posts will appear on blog

## 🔧 Setup Instructions

### 1. Clone and Install

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd dee
npm install  # Only needed if using upload server
```

### 2. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: `dee-s-site` (or your preferred name)
3. Enable **Authentication** → Email/Password & GitHub OAuth providers
4. Enable **Realtime Database** → Start in test mode

#### Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to **Your apps** → Click web icon (</>) to add a web app
3. Copy the `firebaseConfig` object
4. Paste it into:
   - `adminscript.js` (line 5-13)
   - `blogscript.js` (line 3-12)

#### Set Database Rules
1. Go to **Realtime Database** → **Rules**
2. Replace with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "blogPosts": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

3. Click **Publish**

### 3. Cloudinary Setup (for Media Uploads)

1. Sign up at [Cloudinary](https://cloudinary.com/users/register_free) (free tier)
2. Go to your Dashboard and copy your **Cloud Name**
3. Go to **Settings** → **Upload**
4. Create an **Upload Preset**:
   - Name: `blog_uploads`
   - Signing Mode: **Unsigned**
   - Click **Save**
5. Update `adminscript.js` line 233:
   ```javascript
   const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload';
   ```
   Replace `YOUR_CLOUD_NAME` with your actual Cloudinary cloud name

### 4. GitHub OAuth Setup (Optional)

To enable GitHub sign-in for the admin panel:
   - Save as `serviceAccountKey.json` in project root

2. Set CORS rules (requires `gsutil`):
   ```bash
   gsutil cors set cors.json gs://your-bucket-name.appspot.com
   ```

3. Update `adminscript.js` to use the upload server (see `server.js`)

### 5. Run Local Development Server

```bash
# Start static file server
python3 -m http.server 8000

# Or use Node.js
npx http-server -p 8000

# If using Firebase Storage uploads, also run:
npm start  # Starts upload proxy on port 4001
```

### 6. First Login

1. Open http://localhost:8000/admin.html
2. Create an account with email/password
3. Start creating blog posts!

## 🎯 Usage Guide

### Creating a Blog Post

1. **Navigate** to `admin.html` and sign in
2. **Fill out the form**:
   - Title (supports `` `inline code` ``)
   - Category (tutorials/projects/tips)
   - Date (defaults to today)
   - Excerpt (short description, 150 chars recommended)
   - Content (full post body)
   - Featured Media:
     - Option A: Paste media URL
     - Option B: Upload image/video (auto-uploads to Cloudinary)
   - Tags (press Enter after each tag)
   - Publish Time (optional: schedule for future)
3. **Preview** updates live as you type
4. **Click "Create Post"** to publish immediately or schedule
5. **View on blog** at `blog.html`

### Managing Posts

- **Edit**: Click "Edit" on any post in the Manage Posts section
- **Delete**: Click "Delete" and confirm in the modal
- **Search**: Type in the search box to filter by title/tags
- **Filter**: Use dropdowns to filter by category or status

### Reading Posts (Public Blog)

1. Open `blog.html`
2. Browse post cards with featured media
3. Click **"Read More →"** to open full post modal
4. Close modal by:
   - Clicking the × button
   - Pressing Escape
   - Clicking outside the modal

## 🔐 Security Configuration

### Firebase Realtime Database Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "blogPosts": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

**Explanation**:
- `users/{uid}` – Only authenticated users can read/write their own data
- `blogPosts` – Anyone can read (public blog), only authenticated users can write

### Cloudinary Configuration

Cloudinary handles media uploads securely with:
- **Upload Preset**: `blog_uploads` set to Unsigned mode
- **CDN Delivery**: Automatic CORS and optimization
- **Free Tier**: Up to 25GB storage, 25GB bandwidth per month

## 🎨 Customization

### Branding
- Update name in `index.html` line 16: `<div class="nav-brand">Dee</div>`
- Update footer in all pages: Line ~130+ in each HTML file
- Replace logo in `media/favicon.svg`

### Colors
Edit CSS variables in `styles.css` (lines 9-25):

```css
:root {
    --primary-color: #1e3a8a;
    --secondary-color: #1e40af;
    --accent-color: #2563eb;
    --text-primary: #1f2937;
    --bg-primary: #ffffff;
    /* ... */
}
```

### Default Blog Posts
Edit the array in `blog.html` (lines 150-228) to customize placeholder posts

## 📊 Data Structure

### Blog Post Object

```javascript
{
  id: "generated-firebase-key",
  title: "Post Title",
  slug: "post-title",
  excerpt: "Brief summary...",
  content: "Full post content...",
  category: "tutorials",
  tags: ["JavaScript", "React"],
  author: "Dee",
  date: "2026-02-15",
  image: "https://...",           // Deprecated, use mediaUrl
  mediaUrl: "https://...",         // Cloudinary secure URL
  mediaType: "image",              // "image" or "video"
  status: "published",             // "published", "scheduled", "draft"
  publishAt: "",                   // ISO date for scheduled posts
  createdAt: "2026-02-15T10:30:00Z",
  updatedAt: "2026-02-15T10:30:00Z",
  publishedAt: "2026-02-15T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Posts Not Appearing on Blog
1. Check Firebase Database rules allow public read on `blogPosts`
2. Verify post `status` is `"published"` (not `"scheduled"` or `"draft"`)
3. Check browser console (F12) for permission errors
4. Ensure Firebase config is correct in `blogscript.js`

### Upload Failing
1. **Cloudinary errors**: Verify Cloud Name and upload preset name
2. **"Upload preset not found"**: Make sure preset is named `blog_uploads` and is Unsigned
3. **CORS errors**: Cloudinary handles CORS automatically
4. **Network errors**: Check internet connection and Cloudinary config

### Permission Denied
1. Update Firebase Database rules (see Security Configuration above)
2. Sign out and sign back in to refresh auth token
3. Check Firebase Auth is enabled in console

### Modal Not Opening
1. Check browser console for JavaScript errors
2. Verify `postsCollection` array is populated
3. Hard refresh (Ctrl+Shift+R) to clear cache

## 📸 Media Guidelines

### Images
- **Format**: JPG, PNG, WebP, or AVIF
- **Size**: 1200×800px recommended for featured images
- **File size**: <500KB (use compression tools)
- **Ratio**: 3:2 aspect ratio looks best in cards

### Videos
- **Format**: MP4, WebM, MOV
- **Duration**: 15-30 seconds for featured clips
- **Resolution**: 1280×720 or 1920×1080
- **File size**: <10MB recommended
- **Codec**: H.264 for broad compatibility

### Icons & Logos
- **Format**: SVG preferred (or PNG with transparency)
- **Size**: 64×64 to 512×512 pixels
- **Colors**: Match brand palette in `styles.css`

## 🚀 Deployment

### Static Hosting (Vercel, Netlify, GitHub Pages)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Configure build settings:
   - **Build command**: (none, static site)
   - **Publish directory**: `/` (root)
4. Add environment variables (if any)
5. Deploy!

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| [docs/README_ADMIN.md](docs/README_ADMIN.md) | Admin panel architecture and workflows |
| [docs/ADMIN_IMPROVEMENTS.md](docs/ADMIN_IMPROVEMENTS.md) | Admin enhancement notes and updates |
| [docs/ADMIN_QUICK_START.md](docs/ADMIN_QUICK_START.md) | 5-minute setup checklist |
| [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) | Detailed Firebase configuration |
| [docs/FIREBASE_CONFIG_LOCATION.md](docs/FIREBASE_CONFIG_LOCATION.md) | Where to place Firebase credentials and config |
| [docs/SYSTEM_CSS_DESIGN.md](docs/SYSTEM_CSS_DESIGN.md) | UI components and visual guidelines |

## 🤝 Contributing

This is a personal portfolio project, but suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

See [LICENSE](LICENSE). Free to use and adapt for personal projects. Attribution appreciated but not required.

## 💡 Credits

- **Developer**: Dee (Agoma Divine E.)
- **Framework**: None (Vanilla JS for maximum performance)
- **Icons**: Hand-crafted SVGs
- **Fonts**: Inter (Google Fonts)

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**

