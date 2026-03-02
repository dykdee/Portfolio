'use strict';

// Firebase configuration for the admin panel is loaded from /firebase-config.js
const firebaseConfig = window.FIREBASE_CONFIG;
if (!firebaseConfig) {
    throw new Error('Missing Firebase config. Add Firebase values to .env and run the Node server to serve /firebase-config.js.');
}

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const blogPostsRef = database.ref('blogPosts');
const storage = firebase.storage();

let currentUser = null;
let deletePostId = null;
let allPosts = [];
const imageFileInput = document.getElementById('post-image-file');
let imageFilePreviewUrl = '';

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function inlineCodeMarkup(value) {
    const escaped = escapeHtml(value || '');
    return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

function setPreviewHtml(element, text) {
    if (!element) return;
    element.innerHTML = inlineCodeMarkup(text);
}

const PLACEHOLDER_MEDIA_URL = 'https://via.placeholder.com/400x250?text=Blog+Post';
const mediaStatusEl = document.getElementById('media-upload-status');
let imageFileMimeType = 'image';

function detectMediaTypeFromUrl(url) {
    if (!url) return 'image';
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) ? 'video' : 'image';
}

function setMediaStatus(message) {
    if (mediaStatusEl) {
        mediaStatusEl.textContent = message;
    }
}

function renderPreviewMedia(src, type) {
    const container = document.getElementById('preview-media');
    if (!container) return;
    const safeSrc = escapeHtml(src || PLACEHOLDER_MEDIA_URL);
    if (type === 'video') {
        container.innerHTML = `
            <video src="${safeSrc}" muted autoplay loop playsinline controls></video>
        `;
    } else {
        container.innerHTML = `
            <img src="${safeSrc}" alt="Preview media">
        `;
    }
}

const authForm = document.getElementById('auth-form');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const submitBtn = document.getElementById('auth-submit');

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            console.log('✓ Email/password sign-in successful:', result.user.email);
            showAlert(`Welcome, ${email}!`);
        } catch (error) {
            console.error('Sign-in error:', error.code, error.message);
            showAlert(error.message, 'error');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}
// Set up auth state listener
auth.onAuthStateChanged((user) => {
    currentUser = user;
    console.log('Auth state changed:', user ? `Logged in as ${user.email}` : 'Logged out');

    if (user) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        
        // Scroll to top to show admin section
        window.scrollTo(0, 0);

        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-avatar').textContent = user.email.charAt(0).toUpperCase();

        listenForPosts();
        ensureScheduledPostsPublished();
        setInterval(ensureScheduledPostsPublished, 60000);
        console.log('Admin section displayed for:', user.email);
    } else {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('hidden');
        window.scrollTo(0, 0);
    }
});

// Set up image file input listener
if (imageFileInput) {
    imageFileInput.addEventListener('change', handleImageFileChange);
}

// Sign out function
window.signOut = async function signOut() {
    try {
        await auth.signOut();
        showAlert('Signed out successfully!');
    } catch (error) {
        showAlert(error.message, 'error');
    }
};

function showAlert(message, type = 'success') {
    const alertsContainer = document.getElementById('alerts');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertsContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

function updatePreview() {
    const title = document.getElementById('post-title')?.value?.trim() || 'Post title';
    const excerpt = document.getElementById('post-excerpt')?.value?.trim() || 'Post excerpt will appear here once you start typing.';
    const category = document.getElementById('post-category')?.value || 'Category';
    const dateValue = document.getElementById('post-date')?.value;
    const imageValue = document.getElementById('post-image')?.value?.trim();
    const tags = getTags();

    const previewTitle = document.getElementById('preview-title');
    const previewExcerpt = document.getElementById('preview-excerpt');
    const previewMeta = document.getElementById('preview-meta');
    const previewTags = document.getElementById('preview-tags');

    if (previewTitle) setPreviewHtml(previewTitle, title);
    if (previewExcerpt) setPreviewHtml(previewExcerpt, excerpt);

    const formattedDate = dateValue ? formatDate(dateValue) : 'Date';
    if (previewMeta) previewMeta.textContent = `${category || 'Category'} • ${formattedDate}`;

    const previewSrc = imageFilePreviewUrl || imageValue || PLACEHOLDER_MEDIA_URL;
    const previewType = imageFilePreviewUrl ? imageFileMimeType : detectMediaTypeFromUrl(imageValue);
    renderPreviewMedia(previewSrc, previewType);

    if (previewTags) {
        previewTags.innerHTML = '';
        tags.forEach((tag) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'preview-tag';
            tagEl.textContent = tag;
            previewTags.appendChild(tagEl);
        });
    }
}

function handleImageFileChange() {
    const file = imageFileInput?.files?.[0];
    if (!file) {
        imageFilePreviewUrl = '';
        imageFileMimeType = 'image';
        updatePreview();
        setMediaStatus('');
        return;
    }

    imageFileMimeType = file.type.startsWith('video/') ? 'video' : 'image';
    const reader = new FileReader();
    reader.onload = () => {
        imageFilePreviewUrl = reader.result;
        updatePreview();
    };
    reader.readAsDataURL(file);
    document.getElementById('post-image').value = '';
    setMediaStatus('');
}

async function uploadFeaturedImage(file) {
    if (!file) {
        throw new Error('No image selected');
    }
    if (!currentUser) {
        throw new Error('Sign in before uploading images.');
    }

    const mediaKind = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaStatus(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blog_uploads');

    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/ddtfrh6az/upload';
    
    const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
    }

    const result = await response.json();
    imageFileMimeType = result.resource_type === 'video' ? 'video' : 'image';
    setMediaStatus(`Uploaded: ${file.name} (${mediaKind})`);
    return result.secure_url;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function getTags() {
    const tagsInput = document.getElementById('tags-input');
    return Array.from(tagsInput.querySelectorAll('.tag')).map((tag) =>
        tag.textContent.replace('×', '').trim()
    );
}

function renderTags(tags = []) {
    const tagsInput = document.getElementById('tags-input');
    const tagInput = document.getElementById('tag-input');

    tagsInput.querySelectorAll('.tag').forEach((tag) => tag.remove());

    tags.forEach((tag) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        tagEl.innerHTML = `${tag} <button type="button">×</button>`;
        tagEl.querySelector('button').onclick = () => {
            tagEl.remove();
            updatePreview();
        };
        tagsInput.insertBefore(tagEl, tagInput);
    });

    updatePreview();
}

const tagInputEl = document.getElementById('tag-input');
if (tagInputEl) {
    tagInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.target.value.trim();
            if (value) {
                renderTags([...getTags(), value]);
                e.target.value = '';
            }
        }
    });
}

function listenForPosts() {
    if (!currentUser) return;

    const postsRef = database.ref(`users/${currentUser.uid}/posts`);
    postsRef.on('value', (snapshot) => {
        const postsObj = snapshot.val() || {};
        const posts = Object.keys(postsObj)
            .map((key) => ({ id: key, ...postsObj[key] }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        allPosts = posts;
        applyPostFilters();
    });
}

async function ensureScheduledPostsPublished() {
    if (!currentUser) return;

    const now = new Date();
    const postsRef = database.ref(`users/${currentUser.uid}/posts`);
    const snapshot = await postsRef.once('value');
    const postsObj = snapshot.val() || {};

    await Promise.all(
        Object.entries(postsObj).map(async ([id, post]) => {
            if (!post || post.status !== 'scheduled' || !post.publishAt) return;
            const publishDate = new Date(post.publishAt);
            if (Number.isNaN(publishDate.getTime())) return;
            if (publishDate <= now) {
                const updates = {
                    status: 'published',
                    publishedAt: now.toISOString()
                };
                const multi = {};
                multi[`users/${currentUser.uid}/posts/${id}`] = { ...post, ...updates };
                multi[`blogPosts/${id}`] = { ...post, ...updates };
                await database.ref().update(multi);
            }
        })
    );
}

function renderPosts(posts, totalCount = posts.length) {
    const container = document.getElementById('posts-container');
    const count = posts.length;
    const postsCountEl = document.getElementById('posts-count');
    if (postsCountEl) {
        postsCountEl.textContent = totalCount;
    }
    const statCountEl = document.getElementById('stat-posts-count');
    if (statCountEl) {
        statCountEl.textContent = totalCount;
    }
    const lastSyncEl = document.getElementById('stat-last-sync');
    if (lastSyncEl) {
        lastSyncEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (count === 0) {
        container.innerHTML = '<div class="empty-state">No posts yet. Create your first post!</div>';
        return;
    }

    container.innerHTML = posts.map((post) => `
        <div class="post-item">
            <div class="post-item-title">${post.title}</div>
            <div class="post-item-meta">
                ${post.category} • ${formatDate(post.date)}${post.status === 'scheduled' ? ' • Scheduled' : ''}
            </div>
            <p class="post-item-excerpt">${post.excerpt || ''}</p>
            <div class="post-item-actions">
                <button class="btn btn-secondary btn-small" onclick="editPost('${post.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="openDeleteModal('${post.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function applyPostFilters() {
    const searchInput = document.getElementById('posts-search');
    const filterSelect = document.getElementById('posts-filter');
    const statusSelect = document.getElementById('posts-status');

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = filterSelect ? filterSelect.value : 'all';
    const status = statusSelect ? statusSelect.value : 'all';

    const filtered = allPosts.filter((post) => {
        const matchesCategory = category === 'all' || post.category === category;
        const matchesStatus = status === 'all' || post.status === status || (!post.status && status === 'published');
        const matchesQuery = !query
            || post.title?.toLowerCase().includes(query)
            || post.excerpt?.toLowerCase().includes(query)
            || (post.tags || []).some((tag) => tag.toLowerCase().includes(query));
        return matchesCategory && matchesStatus && matchesQuery;
    });

    renderPosts(filtered, allPosts.length);
}

const postDateInput = document.getElementById('post-date');
if (postDateInput) {
    postDateInput.valueAsDate = new Date();
}

updatePreview();

const postForm = document.getElementById('post-form');
if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            showAlert('You must be signed in to create posts', 'error');
            return;
        }

        const postId = postForm.dataset.editId;
        const title = document.getElementById('post-title').value;
        const imageInput = document.getElementById('post-image');
        let imageUrlValue = imageInput?.value?.trim() || '';
        const imageFile = imageFileInput?.files?.[0];
        if (imageFile) {
            imageUrlValue = await uploadFeaturedImage(imageFile);
            if (imageInput) {
                imageInput.value = imageUrlValue;
            }
            imageFilePreviewUrl = '';
            updatePreview();
        }
        const submitBtn = document.getElementById('submit-btn');
        const publishAtInput = document.getElementById('post-publish-at');
        const publishAtValue = publishAtInput ? publishAtInput.value : '';
        const publishAt = publishAtValue ? new Date(publishAtValue) : null;
        const isScheduled = publishAt && !Number.isNaN(publishAt.getTime()) && publishAt > new Date();

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const resolvedMediaUrl = imageUrlValue || PLACEHOLDER_MEDIA_URL;
        const resolvedMediaType = imageFile ? imageFileMimeType : detectMediaTypeFromUrl(resolvedMediaUrl);

        const postData = {
            title,
            slug: generateSlug(title),
            excerpt: document.getElementById('post-excerpt').value,
            content: document.getElementById('post-content').value,
            category: document.getElementById('post-category').value,
            tags: getTags(),
            author: 'Dee',
            date: document.getElementById('post-date').value,
            image: resolvedMediaUrl,
            updatedAt: new Date().toISOString(),
            publishAt: publishAt ? publishAt.toISOString() : '',
            status: isScheduled ? 'scheduled' : 'published'
        };
        postData.mediaUrl = resolvedMediaUrl;
        postData.mediaType = resolvedMediaType;

        try {
            if (postId) {
                if (!postData.publishedAt && postData.status === 'published') {
                    postData.publishedAt = new Date().toISOString();
                }
                const updates = {};
                updates[`users/${currentUser.uid}/posts/${postId}`] = postData;
                updates[`blogPosts/${postId}`] = postData;
                await database.ref().update(updates);
                showAlert(isScheduled ? 'Post scheduled successfully!' : 'Post updated successfully!');
            } else {
                postData.createdAt = new Date().toISOString();
                if (!isScheduled) {
                    postData.publishedAt = new Date().toISOString();
                }
                const newPostRef = database.ref(`users/${currentUser.uid}/posts`).push();
                const newPostId = newPostRef.key;
                const updates = {};
                updates[`users/${currentUser.uid}/posts/${newPostId}`] = postData;
                updates[`blogPosts/${newPostId}`] = postData;
                await database.ref().update(updates);
                showAlert(isScheduled ? 'Post scheduled successfully!' : 'Post created successfully!');
            }

            postForm.reset();
            postForm.dataset.editId = '';
            document.getElementById('form-title').textContent = 'Compose Post';
            document.getElementById('submit-btn').textContent = 'Create Post';
            document.getElementById('cancel-edit-btn').style.display = 'none';
            document.getElementById('post-date').valueAsDate = new Date();
            const publishAtInput = document.getElementById('post-publish-at');
            if (publishAtInput) {
                publishAtInput.value = '';
            }
            renderTags();
            if (imageFileInput) {
                imageFileInput.value = '';
            }
            imageFilePreviewUrl = '';
            updatePreview();
        } catch (error) {
            if (error && (error.code === 'PERMISSION_DENIED' || /PERMISSION_DENIED/i.test(error.message))) {
                showAlert('Permission denied. Update your Firebase Realtime Database rules to allow writes to users/{uid}/posts and blogPosts.', 'error');
            } else {
                showAlert(error.message, 'error');
            }
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    postForm.addEventListener('reset', () => {
        if (imageFileInput) {
            imageFileInput.value = '';
        }
        imageFilePreviewUrl = '';
        imageFileMimeType = 'image';
        setMediaStatus('');
        updatePreview();
    });
}

window.editPost = function editPost(postId) {
    if (!currentUser) return;

    database.ref(`users/${currentUser.uid}/posts/${postId}`).once('value', (snapshot) => {
        const post = snapshot.val();
        if (!post) return;

        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-date').value = post.date;
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-image').value = post.image || '';
        const publishAtInput = document.getElementById('post-publish-at');
        if (publishAtInput) {
            publishAtInput.value = post.publishAt ? post.publishAt.slice(0, 16) : '';
        }

        renderTags(post.tags || []);

        postForm.dataset.editId = postId;
        document.getElementById('form-title').textContent = 'Edit Post';
        document.getElementById('submit-btn').textContent = 'Update Post';
        document.getElementById('cancel-edit-btn').style.display = 'block';

        updatePreview();
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    });
};

window.openDeleteModal = function openDeleteModal(postId) {
    deletePostId = postId;
    document.getElementById('delete-modal').classList.add('active');
};

window.closeDeleteModal = function closeDeleteModal() {
    deletePostId = null;
    document.getElementById('delete-modal').classList.remove('active');
};

window.confirmDelete = async function confirmDelete() {
    if (!deletePostId || !currentUser) return;

    try {
        const updates = {};
        updates[`users/${currentUser.uid}/posts/${deletePostId}`] = null;
        updates[`blogPosts/${deletePostId}`] = null;
        await database.ref().update(updates);
        showAlert('Post deleted successfully!');
        closeDeleteModal();
    } catch (error) {
        showAlert(error.message, 'error');
    }
};

const cancelEditBtn = document.getElementById('cancel-edit-btn');
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        postForm.reset();
        postForm.dataset.editId = '';
        document.getElementById('form-title').textContent = 'Compose Post';
        document.getElementById('submit-btn').textContent = 'Create Post';
        cancelEditBtn.style.display = 'none';
        document.getElementById('post-date').valueAsDate = new Date();
        const publishAtInput = document.getElementById('post-publish-at');
        if (publishAtInput) {
            publishAtInput.value = '';
        }
        renderTags();
    });
}

['post-title', 'post-excerpt', 'post-category', 'post-date', 'post-image'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    }
});

const postsSearchInput = document.getElementById('posts-search');
if (postsSearchInput) {
    postsSearchInput.addEventListener('input', applyPostFilters);
}

const postsFilterSelect = document.getElementById('posts-filter');
if (postsFilterSelect) {
    postsFilterSelect.addEventListener('change', applyPostFilters);
}

const postsStatusSelect = document.getElementById('posts-status');
if (postsStatusSelect) {
    postsStatusSelect.addEventListener('change', applyPostFilters);
}

const adminNavToggle = document.getElementById('admin-nav-toggle');
const adminNavLinks = document.getElementById('admin-nav-links');
if (adminNavToggle && adminNavLinks) {
    adminNavToggle.addEventListener('click', () => {
        adminNavLinks.classList.toggle('open');
        adminNavToggle.classList.toggle('open');
    });

    adminNavLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            adminNavLinks.classList.remove('open');
            adminNavToggle.classList.remove('open');
        });
    });
}

const deleteModal = document.getElementById('delete-modal');
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target.id === 'delete-modal') {
            closeDeleteModal();
        }
    });
}
