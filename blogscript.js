'use strict';

const firebaseConfig = window.FIREBASE_CONFIG;
if (!firebaseConfig) {
    throw new Error('Missing Firebase config. Copy firebase-config.example.js to firebase-config.js and fill in your credentials.');
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const blogPostsRef = database.ref('blogPosts');
const defaultBlogPosts = window.DEFAULT_BLOG_POSTS || [];
const PLACEHOLDER_MEDIA_URL = 'https://via.placeholder.com/640x360?text=Blog+Preview';

const mediaTypePattern = /\.(mp4|webm|ogg|mov|m4v)(?:\?|$)/i;

function determineMediaTypeFromUrl(url) {
    if (!url) return 'image';
    return mediaTypePattern.test(url.split('?')[0]) ? 'video' : 'image';
}

function normalizePost(post) {
    const resolvedMediaUrl = post.mediaUrl || post.image || PLACEHOLDER_MEDIA_URL;
    const resolvedMediaType = post.mediaType || determineMediaTypeFromUrl(resolvedMediaUrl);
    return {
        ...post,
        mediaUrl: resolvedMediaUrl,
        mediaType: resolvedMediaType
    };
}

async function promoteScheduledPosts() {
    const now = new Date();
    const snapshot = await blogPostsRef.once('value');
    const postsObj = snapshot.val() || {};

    await Promise.all(
        Object.entries(postsObj).map(async ([id, post]) => {
            if (!post || post.status !== 'scheduled' || !post.publishAt) return;
            const publishDate = new Date(post.publishAt);
            if (Number.isNaN(publishDate.getTime())) return;
            if (publishDate <= now) {
                await blogPostsRef.child(id).update({
                    status: 'published',
                    publishedAt: now.toISOString()
                });
            }
        })
    );
}

async function fetchAllPosts() {
    const snapshot = await blogPostsRef.once('value');
    const postsObj = snapshot.val() || {};
    return Object.keys(postsObj).map((key) => ({ id: key, ...postsObj[key] }));
}

function filterPublished(posts) {
    return posts.filter((post) => !post.status || post.status === 'published');
}

function sortPosts(posts) {
    const getTimestamp = (post) => {
        const source = post.date || post.publishedAt || post.createdAt;
        const time = new Date(source).getTime();
        return Number.isNaN(time) ? 0 : time;
    };
    return posts.slice().sort((a, b) => getTimestamp(b) - getTimestamp(a));
}

function createSeedPost(post) {
    const timestamp = new Date().toISOString();
    const seeded = {
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
        status: 'published',
        createdAt: post.createdAt || timestamp,
        updatedAt: post.updatedAt || timestamp,
        publishedAt: post.publishedAt || timestamp,
        publishAt: post.publishAt || ''
    };
    return normalizePost(seeded);
}

async function seedDefaultPosts(existingPosts) {
    if (!defaultBlogPosts.length) {
        return false;
    }

    const normalizedExisting = existingPosts.map(normalizePost);
    const existingSlugs = new Set(normalizedExisting.map((post) => post.slug));
    const missingTemplatePosts = defaultBlogPosts.filter((post) => post.slug && !existingSlugs.has(post.slug));

    if (!missingTemplatePosts.length) {
        return false;
    }

    const updates = {};
    missingTemplatePosts.forEach((post) => {
        const id = blogPostsRef.push().key;
        if (!id) return;
        updates[id] = createSeedPost(post);
    });

    if (!Object.keys(updates).length) {
        return false;
    }

    await blogPostsRef.update(updates);
    return true;
}

async function loadPreparedPosts() {
    let posts = await fetchAllPosts();
    return sortPosts(filterPublished(posts.map(normalizePost)));
}

// Start loading posts immediately instead of waiting for DOMContentLoaded
async function initializeBlog() {
    const renderTarget = typeof window.updateBlogPosts === 'function' ? window.updateBlogPosts : renderPosts;
    
    try {
        const posts = await loadPreparedPosts();
        renderTarget(posts);
        database.goOffline();
    } catch (error) {
        console.error('Failed to load Firebase posts', error);
        if (defaultBlogPosts.length) {
            renderTarget(defaultBlogPosts);
        }
    }
}

// Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBlog, { once: true });
} else {
    // DOM is already ready, start loading posts immediately
    initializeBlog();
}
