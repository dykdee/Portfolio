// Blog post utilities for normalization, filtering, and formatting

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createMediaPlaceholderUrl({
  label = 'Media',
  width = 640,
  height = 360
} = {}) {
  const safeWidth = Number.isFinite(width) ? width : 640;
  const safeHeight = Number.isFinite(height) ? height : 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="${safeWidth}" height="${safeHeight}" rx="28" fill="url(#bg)" />
      <circle cx="${Math.round(safeWidth * 0.2)}" cy="${Math.round(safeHeight * 0.28)}" r="${Math.round(Math.min(safeWidth, safeHeight) * 0.08)}" fill="rgba(148,163,184,0.16)" />
      <circle cx="${Math.round(safeWidth * 0.78)}" cy="${Math.round(safeHeight * 0.72)}" r="${Math.round(Math.min(safeWidth, safeHeight) * 0.11)}" fill="rgba(148,163,184,0.12)" />
      <text x="50%" y="50%" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.max(18, Math.round(safeWidth * 0.05))}" font-weight="600" text-anchor="middle" dominant-baseline="middle">
        ${escapeXml(label)}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const PLACEHOLDER_MEDIA_URL = createMediaPlaceholderUrl({
  label: 'Blog Preview',
  width: 640,
  height: 360
});

export function determineMediaTypeFromUrl(url) {
  if (!url) return 'image';
  const mediaTypePattern = /\.(mp4|webm|ogg|mov|m4v)(?:\?|$)/i;
  return mediaTypePattern.test(url.split('?')[0]) ? 'video' : 'image';
}

export function normalizePost(post) {
  const resolvedMediaUrl = post.mediaUrl || post.image || PLACEHOLDER_MEDIA_URL;
  const resolvedMediaType = post.mediaType || determineMediaTypeFromUrl(resolvedMediaUrl);
  return {
    ...post,
    mediaUrl: resolvedMediaUrl,
    mediaType: resolvedMediaType
  };
}

export function filterPublished(posts) {
  return posts.filter((post) => !post.status || post.status === 'published');
}

export function sortPosts(posts) {
  const getTimestamp = (post) => {
    const source = post.date || post.publishedAt || post.createdAt;
    const time = new Date(source).getTime();
    return Number.isNaN(time) ? 0 : time;
  };
  return posts.slice().sort((a, b) => getTimestamp(b) - getTimestamp(a));
}

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
