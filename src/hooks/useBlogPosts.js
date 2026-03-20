import { useEffect, useState } from 'react';
import { ref, get, update, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { normalizePost, filterPublished, sortPosts } from '../utils/blogUtils';

function toTime(value) {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function credentialSortTime(credential) {
  const issuedTime = toTime(credential.date);
  if (issuedTime !== Number.NEGATIVE_INFINITY) {
    return issuedTime;
  }

  return Math.max(toTime(credential.updatedAt), toTime(credential.createdAt));
}

export function useBlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const blogPostsRef = ref(database, 'blogPosts');
        const snapshot = await get(blogPostsRef);
        const postsObj = snapshot.val() || {};

        // Promote scheduled posts that are due
        const now = new Date();
        await Promise.all(
          Object.entries(postsObj).map(async ([id, post]) => {
            if (!post || post.status !== 'scheduled' || !post.publishAt) return;
            const publishDate = new Date(post.publishAt);
            if (Number.isNaN(publishDate.getTime())) return;
            if (publishDate <= now) {
              await update(ref(database, `blogPosts/${id}`), {
                status: 'published',
                publishedAt: now.toISOString()
              });
            }
          })
        );

        const allPosts = Object.keys(postsObj)
          .map((key) => ({ id: key, ...postsObj[key] }))
          .map(normalizePost);

        setPosts(sortPosts(filterPublished(allPosts)));
        setError(null);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
        setError(err.message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

export function useAdminPosts(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postsRef = ref(database, `users/${userId}/posts`);

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsObj = snapshot.val() || {};
      const prepared = Object.keys(postsObj)
        .map((key) => ({ id: key, ...postsObj[key] }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(prepared);
      setLoading(false);
    });

    return () => off(postsRef, 'value', unsubscribe);
  }, [userId]);

  return { posts, loading };
}

export function usePortfolioProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(database, 'portfolioProjects');

    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const projectsObj = snapshot.val() || {};
      const prepared = Object.keys(projectsObj)
        .map((key) => ({ id: key, ...projectsObj[key] }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setProjects(prepared);
      setLoading(false);
    });

    return () => off(projectsRef, 'value', unsubscribe);
  }, []);

  return { projects, loading };
}

export function usePortfolioCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const credentialsRef = ref(database, 'portfolioCredentials');

    const unsubscribe = onValue(
      credentialsRef,
      (snapshot) => {
        const credentialsObj = snapshot.val() || {};
        const prepared = Object.keys(credentialsObj)
          .map((key) => ({ id: key, ...credentialsObj[key] }))
          .sort((a, b) => credentialSortTime(b) - credentialSortTime(a));

        setCredentials(prepared);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load portfolio credentials:', err);
        setCredentials([]);
        setError(err.message || 'Failed to load credentials.');
        setLoading(false);
      }
    );

    return () => off(credentialsRef, 'value', unsubscribe);
  }, []);

  return { credentials, loading, error };
}
