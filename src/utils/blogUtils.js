// Blog post utilities for normalization, filtering, and formatting

const PLACEHOLDER_MEDIA_URL = 'https://via.placeholder.com/640x360?text=Blog+Preview';

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
