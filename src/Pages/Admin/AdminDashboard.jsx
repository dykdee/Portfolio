import { useEffect, useMemo, useRef, useState } from 'react';
import { get, push, ref, update } from 'firebase/database';
import {
  Award,
  Bell,
  BrainCircuit,
  Briefcase,
  ChevronRight,
  ExternalLink,
  FileText,
  Github,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Pencil,
  Search,
  Settings,
  Trash2,
  Upload,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminPosts } from '../../hooks/useBlogPosts';
import { createMediaPlaceholderUrl, determineMediaTypeFromUrl, formatDate, generateSlug } from '../../utils/blogUtils';

const PLACEHOLDER_MEDIA_URL = createMediaPlaceholderUrl({
  label: 'Media',
  width: 1200,
  height: 630
});

const EMPTY_BLOG_DRAFT = {
  title: '',
  excerpt: '',
  content: '',
  category: 'tutorials',
  tags: [],
  date: new Date().toISOString().split('T')[0],
  image: '',
  mediaUrl: '',
  mediaType: 'image',
  publishAt: ''
};

const EMPTY_PROJECT_DRAFT = {
  title: '',
  description: '',
  category: 'Full Stack',
  status: 'Live',
  tags: '',
  image: '',
  liveUrl: '',
  githubUrl: ''
};

const EMPTY_CREDENTIAL_DRAFT = {
  title: '',
  issuer: '',
  date: '',
  type: 'certificate',
  badgeSource: 'github',
  description: '',
  fileUrl: '',
  fileType: 'pdf',
  verificationUrl: ''
};

const FIREBASE_CONFIG_FIELDS = [
  { key: 'apiKey', label: 'Firebase API Key' },
  { key: 'authDomain', label: 'Auth Domain' },
  { key: 'databaseURL', label: 'Database URL' },
  { key: 'projectId', label: 'Project ID' },
  { key: 'storageBucket', label: 'Storage Bucket' },
  { key: 'messagingSenderId', label: 'Messaging Sender ID' },
  { key: 'appId', label: 'App ID' },
  { key: 'measurementId', label: 'Measurement ID' }
];

const EMPTY_FIREBASE_SECRETS = FIREBASE_CONFIG_FIELDS.reduce((acc, field) => {
  acc[field.key] = '';
  return acc;
}, {});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function normalizeDateInputValue(value) {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function formatCredentialDate(value) {
  if (!value) {
    return '-';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function toTimestamp(value) {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function sortCredentialsByIssuedDateDesc(a, b) {
  const aIssuedTime = toTimestamp(a.date);
  const bIssuedTime = toTimestamp(b.date);

  const aTime = aIssuedTime !== Number.NEGATIVE_INFINITY
    ? aIssuedTime
    : Math.max(toTimestamp(a.updatedAt), toTimestamp(a.createdAt));
  const bTime = bIssuedTime !== Number.NEGATIVE_INFINITY
    ? bIssuedTime
    : Math.max(toTimestamp(b.updatedAt), toTimestamp(b.createdAt));

  return bTime - aTime;
}

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-left',
        active ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'
      )}
    >
      <Icon size={20} className={cn(active ? 'text-white' : 'text-zinc-400 group-hover:text-black')} />
      <span className="font-medium text-sm">{label}</span>
      {active ? <ChevronRight size={16} className="ml-auto opacity-50" /> : null}
    </button>
  );
}

export default function AdminDashboard({ user }) {
  const { signOut } = useAuth();
  const { posts, loading: postsLoading } = useAdminPosts(user?.uid);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [blogMode, setBlogMode] = useState('compose');
  const [blogDraft, setBlogDraft] = useState(EMPTY_BLOG_DRAFT);
  const [blogTagInput, setBlogTagInput] = useState('');
  const [blogFile, setBlogFile] = useState(null);
  const [blogEditingId, setBlogEditingId] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatus, setBlogStatus] = useState('all');

  const [projectMode, setProjectMode] = useState('upload');
  const [projectDraft, setProjectDraft] = useState(EMPTY_PROJECT_DRAFT);
  const [projectFile, setProjectFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectEditingId, setProjectEditingId] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('all');

  const [credentialMode, setCredentialMode] = useState('upload');
  const [credentialDraft, setCredentialDraft] = useState(EMPTY_CREDENTIAL_DRAFT);
  const [credentialFile, setCredentialFile] = useState(null);
  const [credentialEditingId, setCredentialEditingId] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialSearch, setCredentialSearch] = useState('');
  const [credentialTypeFilter, setCredentialTypeFilter] = useState('all');
  const [credentialBadgeFilter, setCredentialBadgeFilter] = useState('all');

  const [firebaseSecrets, setFirebaseSecrets] = useState(EMPTY_FIREBASE_SECRETS);
  const [firebaseSecretStatus, setFirebaseSecretStatus] = useState({});
  const [secretsLoading, setSecretsLoading] = useState(false);
  const [secretsSaving, setSecretsSaving] = useState(false);

  const [flash, setFlash] = useState({ type: '', message: '' });
  const contentScrollRef = useRef(null);

  const showFlash = (type, message) => {
    setFlash({ type, message });
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      setFlash((prev) => (prev.message === message ? { type: '', message: '' } : prev));
    }, 3500);
  };

  const getAuthorizedHeaders = async () => {
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchJson = async (path, options = {}) => {
    const fullUrl = `${API_BASE_URL}${path}`;
    let response;

    try {
      response = await fetch(fullUrl, options);
    } catch (networkErr) {
      console.error('Network error:', networkErr, 'URL:', fullUrl);
      throw new Error(`Unable to reach API (${networkErr.message}). Ensure backend is running on port 4001.`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('Non-JSON response:', { status: response.status, contentType, text: text.slice(0, 200) });
      throw new Error(`Backend returned invalid response (${response.status} ${response.statusText}). Ensure backend server is running.`);
    }

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `API error: ${response.status} ${response.statusText}`);
    }

    return payload;
  };

  const loadFirebaseSecretStatus = async () => {
    if (!user) {
      return;
    }

    setSecretsLoading(true);
    try {
      const headers = await getAuthorizedHeaders();
      const payload = await fetchJson('/api/admin/secrets/firebase-config/status', { headers });
      setFirebaseSecretStatus(payload.status || {});
    } catch (err) {
      showFlash('error', err.message || 'Failed to load credentials status.');
    } finally {
      setSecretsLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    async function loadProjects() {
      if (!user?.uid) {
        setProjects([]);
        setProjectsLoading(false);
        return;
      }

      setProjectsLoading(true);
      try {
        const snap = await get(ref(database, `users/${user.uid}/projects`));
        if (!alive) {
          return;
        }
        if (!snap.exists()) {
          setProjects([]);
        } else {
          const entries = Object.entries(snap.val()).map(([id, value]) => ({ id, ...value }));
          setProjects(entries.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
        }
      } catch (err) {
        showFlash('error', err.message || 'Failed to load projects.');
      } finally {
        if (alive) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      alive = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    let alive = true;

    async function loadCredentials() {
      if (!user?.uid) {
        setCredentials([]);
        setCredentialsLoading(false);
        return;
      }

      setCredentialsLoading(true);
      try {
        const snap = await get(ref(database, `users/${user.uid}/credentials`));
        if (!alive) {
          return;
        }
        if (!snap.exists()) {
          setCredentials([]);
        } else {
          const entries = Object.entries(snap.val()).map(([id, value]) => ({ id, ...value }));

          const updates = {};
          entries.forEach((entry) => {
            const normalizedDate = normalizeDateInputValue(entry.date);
            if (normalizedDate && normalizedDate !== entry.date) {
              updates[`users/${user.uid}/credentials/${entry.id}/date`] = normalizedDate;
              updates[`portfolioCredentials/${entry.id}/date`] = normalizedDate;
              entry.date = normalizedDate;
            }
          });

          if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
          }

          setCredentials(entries.sort(sortCredentialsByIssuedDateDesc));
        }
      } catch (err) {
        showFlash('error', err.message || 'Failed to load credentials.');
      } finally {
        if (alive) {
          setCredentialsLoading(false);
        }
      }
    }

    loadCredentials();
    return () => {
      alive = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadFirebaseSecretStatus();
    }
  }, [user?.uid]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const query = blogSearch.trim().toLowerCase();
      const matchesQuery = !query
        || (post.title || '').toLowerCase().includes(query)
        || (post.excerpt || '').toLowerCase().includes(query)
        || (post.tags || []).join(' ').toLowerCase().includes(query);
      const matchesStatus = blogStatus === 'all' || (post.status || 'published') === blogStatus;
      return matchesQuery && matchesStatus;
    });
  }, [posts, blogSearch, blogStatus]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = projectSearch.trim().toLowerCase();
      const matchesQuery = !query
        || (project.title || '').toLowerCase().includes(query)
        || (project.description || '').toLowerCase().includes(query)
        || (project.category || '').toLowerCase().includes(query);
      const matchesStatus = projectStatus === 'all' || (project.status || 'Live') === projectStatus;
      return matchesQuery && matchesStatus;
    });
  }, [projects, projectSearch, projectStatus]);

  const filteredCredentials = useMemo(() => {
    return credentials.filter((credential) => {
      const query = credentialSearch.trim().toLowerCase();
      const matchesQuery = !query
        || (credential.title || '').toLowerCase().includes(query)
        || (credential.issuer || '').toLowerCase().includes(query)
        || (credential.description || '').toLowerCase().includes(query);
      const matchesType = credentialTypeFilter === 'all' || credential.type === credentialTypeFilter;
      const matchesBadgeSource = credentialTypeFilter !== 'badge'
        || credentialBadgeFilter === 'all'
        || (credential.badgeSource || 'other') === credentialBadgeFilter;
      return matchesQuery && matchesType && matchesBadgeSource;
    });
  }, [credentials, credentialSearch, credentialTypeFilter, credentialBadgeFilter]);

  const publishedPostsCount = useMemo(
    () => posts.filter((post) => (post.status || 'published') === 'published').length,
    [posts]
  );

  const scheduledPostsCount = useMemo(
    () => posts.filter((post) => post.status === 'scheduled').length,
    [posts]
  );

  const recentUpdates = useMemo(() => {
    const toItem = (type, item) => {
      const timestamp = Math.max(
        toTimestamp(item.updatedAt),
        toTimestamp(item.createdAt),
        toTimestamp(item.date)
      );

      return {
        id: `${type}-${item.id}`,
        type,
        label: item.title || item.name || 'Untitled',
        subtitle: type === 'post'
          ? (item.category || 'Blog post')
          : type === 'project'
            ? (item.category || 'Project')
            : (item.issuer || 'Credential'),
        timestamp
      };
    };

    return [
      ...posts.map((item) => toItem('post', item)),
      ...projects.map((item) => toItem('project', item)),
      ...credentials.map((item) => toItem('credential', item))
    ]
      .filter((item) => item.timestamp !== Number.NEGATIVE_INFINITY)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  }, [posts, projects, credentials]);

  const blogPreviewMedia = blogDraft.mediaUrl || blogDraft.image || PLACEHOLDER_MEDIA_URL;
  const blogPreviewType = determineMediaTypeFromUrl(blogPreviewMedia);

  const uploadToFirebase = async (file) => {
    if (!user?.uid) {
      throw new Error('You must be signed in to upload files.');
    }

    const body = new FormData();
    body.append('file', file);

    const result = await fetchJson('/api/upload', {
      method: 'POST',
      headers: {
        'x-user-id': user.uid
      },
      body
    });

    return result.url;
  };

  const resetBlogComposer = () => {
    setBlogDraft(EMPTY_BLOG_DRAFT);
    setBlogTagInput('');
    setBlogFile(null);
    setBlogEditingId('');
  };

  const resetProjectComposer = () => {
    setProjectDraft(EMPTY_PROJECT_DRAFT);
    setProjectFile(null);
    setProjectEditingId('');
  };

  const resetCredentialComposer = () => {
    setCredentialDraft(EMPTY_CREDENTIAL_DRAFT);
    setCredentialFile(null);
    setCredentialEditingId('');
  };

  const determineCredentialFileType = (url, file) => {
    const fileName = (file?.name || url || '').toLowerCase();
    const mime = (file?.type || '').toLowerCase();

    if (mime.includes('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(fileName)) {
      return 'image';
    }

    return 'pdf';
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();

    try {
      let mediaUrl = blogDraft.mediaUrl || blogDraft.image || '';
      if (blogFile) {
        mediaUrl = await uploadToFirebase(blogFile);
      }

      const now = new Date().toISOString();
      const status = blogDraft.publishAt && new Date(blogDraft.publishAt) > new Date() ? 'scheduled' : 'published';
      const payload = {
        title: blogDraft.title,
        slug: generateSlug(blogDraft.title),
        excerpt: blogDraft.excerpt,
        content: blogDraft.content,
        category: blogDraft.category,
        tags: blogDraft.tags,
        date: blogDraft.date,
        image: mediaUrl || PLACEHOLDER_MEDIA_URL,
        mediaUrl: mediaUrl || PLACEHOLDER_MEDIA_URL,
        mediaType: determineMediaTypeFromUrl(mediaUrl || PLACEHOLDER_MEDIA_URL),
        author: 'Dee',
        status,
        updatedAt: now
      };

      if (blogDraft.publishAt) {
        payload.publishAt = new Date(blogDraft.publishAt).toISOString();
      }

      const updates = {};
      if (blogEditingId) {
        updates[`users/${user.uid}/posts/${blogEditingId}`] = {
          ...payload,
          createdAt: posts.find((item) => item.id === blogEditingId)?.createdAt || now
        };
        updates[`blogPosts/${blogEditingId}`] = updates[`users/${user.uid}/posts/${blogEditingId}`];
      } else {
        const postRef = push(ref(database, `users/${user.uid}/posts`));
        const id = postRef.key;
        updates[`users/${user.uid}/posts/${id}`] = {
          ...payload,
          createdAt: now,
          publishedAt: status === 'published' ? now : ''
        };
        updates[`blogPosts/${id}`] = updates[`users/${user.uid}/posts/${id}`];
      }

      await update(ref(database), updates);
      resetBlogComposer();
      setBlogMode('manage');
      showFlash('success', blogEditingId ? 'Blog post updated.' : 'Blog post created.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to save blog post.');
    }
  };

  const handleEditBlog = (post) => {
    setBlogEditingId(post.id);
    setBlogDraft({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'tutorials',
      tags: post.tags || [],
      date: post.date || new Date().toISOString().split('T')[0],
      image: post.image || '',
      mediaUrl: post.mediaUrl || post.image || '',
      mediaType: post.mediaType || 'image',
      publishAt: post.publishAt ? post.publishAt.slice(0, 16) : ''
    });
    setBlogMode('compose');
    setActiveTab('blog');
  };

  const handleDeleteBlog = async (id) => {
    try {
      const updates = {};
      updates[`users/${user.uid}/posts/${id}`] = null;
      updates[`blogPosts/${id}`] = null;
      await update(ref(database), updates);
      showFlash('success', 'Blog post deleted.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to delete blog post.');
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();

    try {
      const existingProject = projectEditingId
        ? projects.find((item) => item.id === projectEditingId)
        : null;

      let mediaUrl = projectDraft.image || '';
      if (projectFile) {
        mediaUrl = await uploadToFirebase(projectFile);
      }

      const resolvedMediaType = mediaUrl
        ? determineMediaTypeFromUrl(mediaUrl)
        : (existingProject?.video ? 'video' : 'image');

      const resolvedVideoUrl = resolvedMediaType === 'video'
        ? (mediaUrl || existingProject?.video || '')
        : '';

      const resolvedImageUrl = resolvedMediaType === 'video'
        ? (existingProject?.image || PLACEHOLDER_MEDIA_URL)
        : (mediaUrl || existingProject?.image || PLACEHOLDER_MEDIA_URL);

      const now = new Date().toISOString();
      const payload = {
        title: projectDraft.title,
        name: projectDraft.title,
        description: projectDraft.description.trim(),
        category: projectDraft.category,
        status: projectDraft.status,
        tags: projectDraft.tags.split(',').map((t) => t.trim()).filter(Boolean),
        image: resolvedImageUrl,
        video: resolvedVideoUrl,
        mediaUrl: mediaUrl || resolvedVideoUrl || resolvedImageUrl,
        mediaType: resolvedMediaType,
        liveUrl: projectDraft.liveUrl,
        githubUrl: projectDraft.githubUrl,
        updatedAt: now
      };

      const updates = {};
      if (projectEditingId) {
        updates[`users/${user.uid}/projects/${projectEditingId}`] = {
          ...payload,
          createdAt: projects.find((item) => item.id === projectEditingId)?.createdAt || now
        };
        updates[`portfolioProjects/${projectEditingId}`] = updates[`users/${user.uid}/projects/${projectEditingId}`];
      } else {
        const projectRef = push(ref(database, `users/${user.uid}/projects`));
        const id = projectRef.key;
        updates[`users/${user.uid}/projects/${id}`] = {
          ...payload,
          createdAt: now
        };
        updates[`portfolioProjects/${id}`] = updates[`users/${user.uid}/projects/${id}`];
      }

      await update(ref(database), updates);
      const refreshed = await get(ref(database, `users/${user.uid}/projects`));
      const items = refreshed.exists()
        ? Object.entries(refreshed.val()).map(([id, value]) => ({ id, ...value }))
        : [];
      setProjects(items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
      resetProjectComposer();
      setProjectMode('manage');
      showFlash('success', projectEditingId ? 'Project updated.' : 'Project created.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to save project.');
    }
  };

  const handleEditProject = (project) => {
    setProjectEditingId(project.id);
    setProjectDraft({
      title: project.title || project.name || '',
      description: project.description || '',
      category: project.category || 'Full Stack',
      status: project.status || 'Live',
      tags: (project.tags || []).join(', '),
      image: project.video || project.image || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || ''
    });
    setProjectMode('manage');
    setActiveTab('projects');
  };

  const handleDeleteProject = async (id) => {
    try {
      const updates = {};
      updates[`users/${user.uid}/projects/${id}`] = null;
      updates[`portfolioProjects/${id}`] = null;
      await update(ref(database), updates);
      setProjects((prev) => prev.filter((item) => item.id !== id));
      showFlash('success', 'Project deleted.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to delete project.');
    }
  };

  const handleSaveCredential = async (e) => {
    e.preventDefault();

    try {
      let fileUrl = credentialDraft.fileUrl || '';
      if (credentialFile) {
        fileUrl = await uploadToFirebase(credentialFile);
      }

      const now = new Date().toISOString();
      const payload = {
        title: credentialDraft.title,
        issuer: credentialDraft.issuer,
        date: credentialDraft.date,
        type: credentialDraft.type,
        badgeSource: credentialDraft.type === 'badge' ? credentialDraft.badgeSource : '',
        description: credentialDraft.description.trim(),
        fileUrl,
        fileType: determineCredentialFileType(fileUrl, credentialFile),
        verificationUrl: credentialDraft.verificationUrl.trim(),
        updatedAt: now
      };

      const updates = {};
      if (credentialEditingId) {
        updates[`users/${user.uid}/credentials/${credentialEditingId}`] = {
          ...payload,
          createdAt: credentials.find((item) => item.id === credentialEditingId)?.createdAt || now
        };
        updates[`portfolioCredentials/${credentialEditingId}`] = updates[`users/${user.uid}/credentials/${credentialEditingId}`];
      } else {
        const credentialRef = push(ref(database, `users/${user.uid}/credentials`));
        const id = credentialRef.key;
        updates[`users/${user.uid}/credentials/${id}`] = {
          ...payload,
          createdAt: now
        };
        updates[`portfolioCredentials/${id}`] = updates[`users/${user.uid}/credentials/${id}`];
      }

      await update(ref(database), updates);
      const refreshed = await get(ref(database, `users/${user.uid}/credentials`));
      const items = refreshed.exists()
        ? Object.entries(refreshed.val()).map(([id, value]) => ({ id, ...value }))
        : [];

      setCredentials(items.sort(sortCredentialsByIssuedDateDesc));
      resetCredentialComposer();
      setCredentialMode('manage');
      showFlash('success', credentialEditingId ? 'Credential updated.' : 'Credential uploaded.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to save credential.');
    }
  };

  const handleEditCredential = (credential) => {
    setCredentialEditingId(credential.id);
    setCredentialDraft({
      title: credential.title || '',
      issuer: credential.issuer || '',
      date: normalizeDateInputValue(credential.date),
      type: credential.type || 'certificate',
      badgeSource: credential.badgeSource || 'github',
      description: credential.description || '',
      fileUrl: credential.fileUrl || '',
      fileType: credential.fileType || 'pdf',
      verificationUrl: credential.verificationUrl || ''
    });
    setCredentialMode('upload');
    setActiveTab('credentials');
  };

  const handleDeleteCredential = async (id) => {
    try {
      const updates = {};
      updates[`users/${user.uid}/credentials/${id}`] = null;
      updates[`portfolioCredentials/${id}`] = null;
      await update(ref(database), updates);
      setCredentials((prev) => prev.filter((item) => item.id !== id));
      showFlash('success', 'Credential deleted.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to delete credential.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      showFlash('error', err.message || 'Sign out failed.');
    }
  };

  const handleSaveFirebaseSecrets = async (e) => {
    e.preventDefault();

    const values = Object.entries(firebaseSecrets).reduce((acc, [key, value]) => {
      const trimmed = value.trim();
      if (trimmed) {
        acc[key] = trimmed;
      }
      return acc;
    }, {});

    if (Object.keys(values).length === 0) {
      showFlash('error', 'Enter at least one value to update.');
      return;
    }

    setSecretsSaving(true);
    try {
      const headers = await getAuthorizedHeaders();
      await fetchJson('/api/admin/secrets/firebase-config', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });

      setFirebaseSecrets(EMPTY_FIREBASE_SECRETS);
      await loadFirebaseSecretStatus();
      showFlash('success', 'Credentials updated. Values are now private and only rotatable.');
    } catch (err) {
      showFlash('error', err.message || 'Failed to save credentials.');
    } finally {
      setSecretsSaving(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Projects</p>
          <p className="text-2xl font-bold text-zinc-900">{projects.length}</p>
          <p className="text-xs text-zinc-500 mt-2">Portfolio entries synced to public view</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Published Posts</p>
          <p className="text-2xl font-bold text-zinc-900">{publishedPostsCount}</p>
          <p className="text-xs text-zinc-500 mt-2">Currently visible in the blog</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Scheduled Posts</p>
          <p className="text-2xl font-bold text-zinc-900">{scheduledPostsCount}</p>
          <p className="text-xs text-zinc-500 mt-2">Pending publish time</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Credentials</p>
          <p className="text-2xl font-bold text-zinc-900">{credentials.length}</p>
          <p className="text-xs text-zinc-500 mt-2">Certificates, certifications, and badges</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-zinc-900">Recent Content Updates</h3>
          <button onClick={() => setActiveTab('blog')} className="text-sm text-blue-700 font-medium hover:underline">Manage Content</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-y border-zinc-100">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Context</th>
                <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentUpdates.length ? recentUpdates.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 capitalize">{item.type}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{item.label}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{item.subtitle}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(new Date(item.timestamp).toISOString())}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-sm text-zinc-500">No content updates yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {projectMode === 'upload' || (projectMode === 'manage' && projectEditingId) ? (
        <form className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5" onSubmit={handleSaveProject}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">{projectEditingId ? 'Edit Project' : 'Upload Project'}</h2>
            <button type="button" onClick={resetProjectComposer} className="text-sm text-zinc-500 hover:text-black">Reset</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Project title" value={projectDraft.title} onChange={(e) => setProjectDraft((prev) => ({ ...prev, title: e.target.value }))} required />
            <input className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Category" value={projectDraft.category} onChange={(e) => setProjectDraft((prev) => ({ ...prev, category: e.target.value }))} required />
            <select className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={projectDraft.status} onChange={(e) => setProjectDraft((prev) => ({ ...prev, status: e.target.value }))}>
              <option>Live</option>
              <option>Beta</option>
              <option>Draft</option>
            </select>
            <input type="url" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Live URL" value={projectDraft.liveUrl} onChange={(e) => setProjectDraft((prev) => ({ ...prev, liveUrl: e.target.value }))} />
            <input type="url" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm md:col-span-2" placeholder="GitHub URL" value={projectDraft.githubUrl} onChange={(e) => setProjectDraft((prev) => ({ ...prev, githubUrl: e.target.value }))} />
            <input type="url" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm md:col-span-2" placeholder="Project media URL (image or short video)" value={projectDraft.image} onChange={(e) => setProjectDraft((prev) => ({ ...prev, image: e.target.value }))} />
            <div className="md:col-span-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Attach project media</p>
                  <p className="text-xs text-zinc-500">Image or short video clip (10-15s recommended).</p>
                </div>
                <label className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-xl hover:bg-zinc-800 cursor-pointer">
                  <Upload size={16} />
                  Choose File
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
                    className="hidden"
                    onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                {projectFile ? `Selected file: ${projectFile.name}` : 'No file selected yet.'}
              </p>
            </div>
          </div>

          <textarea className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm min-h-28" placeholder="Project description (optional)" value={projectDraft.description} onChange={(e) => setProjectDraft((prev) => ({ ...prev, description: e.target.value }))} />

          <div>
            <input
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm"
              placeholder="Tags (comma-separated, e.g. React, Node.js, Firebase)"
              value={projectDraft.tags}
              onChange={(e) => setProjectDraft((prev) => ({ ...prev, tags: e.target.value }))}
            />
            {projectDraft.tags.trim() ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {projectDraft.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md text-xs font-mono text-zinc-700">`{tag}`</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={projectEditingId ? resetProjectComposer : () => setProjectMode('manage')}
              className="px-4 py-2 text-sm border border-zinc-200 rounded-xl hover:bg-zinc-50"
            >
              {projectEditingId ? 'Cancel Edit' : 'Manage Existing'}
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-black text-white rounded-xl hover:bg-zinc-800">{projectEditingId ? 'Update Project' : 'Save Project'}</button>
          </div>
        </form>
      ) : null}

      {projectMode === 'manage' ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Manage Projects</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm w-full md:w-60" placeholder="Search projects" value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} />
              <select className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="Live">Live</option>
                <option value="Beta">Beta</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {projectsLoading ? (
            <div className="p-8 text-sm text-zinc-500">Loading projects...</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredProjects.length ? filteredProjects.map((project) => (
                <div key={project.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">{project.title || project.name}</p>
                    <p className="text-sm text-zinc-500">{project.category} • {project.status || 'Live'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.liveUrl ? (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black">
                        <ExternalLink size={14} />
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black">
                        <Github size={14} />
                      </a>
                    ) : null}
                    <button onClick={() => handleEditProject(project)} className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 border border-rose-200 rounded-lg text-rose-500 hover:text-rose-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )) : <div className="p-8 text-sm text-zinc-500">No projects found.</div>}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const renderBlog = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {blogMode === 'compose' ? (
        <form className="grid grid-cols-1 xl:grid-cols-3 gap-6" onSubmit={handleSaveBlog}>
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">{blogEditingId ? 'Edit Blog Post' : 'Compose Blog Post'}</h2>
              <button type="button" onClick={resetBlogComposer} className="text-sm text-zinc-500 hover:text-black">Reset</button>
            </div>

            <input className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Title" value={blogDraft.title} onChange={(e) => setBlogDraft((prev) => ({ ...prev, title: e.target.value }))} required />
            <textarea className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm min-h-24" placeholder="Excerpt" value={blogDraft.excerpt} onChange={(e) => setBlogDraft((prev) => ({ ...prev, excerpt: e.target.value }))} required />
            <textarea className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm min-h-40" placeholder="Content" value={blogDraft.content} onChange={(e) => setBlogDraft((prev) => ({ ...prev, content: e.target.value }))} required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={blogDraft.category} onChange={(e) => setBlogDraft((prev) => ({ ...prev, category: e.target.value }))}>
                <option value="tutorials">Tutorials</option>
                <option value="projects">Projects</option>
                <option value="tips">Tips & Tricks</option>
              </select>
              <input type="date" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={blogDraft.date} onChange={(e) => setBlogDraft((prev) => ({ ...prev, date: e.target.value }))} />
              <input type="url" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm md:col-span-2" placeholder="Media URL" value={blogDraft.mediaUrl} onChange={(e) => setBlogDraft((prev) => ({ ...prev, mediaUrl: e.target.value, image: e.target.value }))} />
              <input type="datetime-local" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm md:col-span-2" value={blogDraft.publishAt} onChange={(e) => setBlogDraft((prev) => ({ ...prev, publishAt: e.target.value }))} />
              <input type="file" accept="image/*,video/*" className="md:col-span-2 text-sm text-zinc-500" onChange={(e) => setBlogFile(e.target.files?.[0] || null)} />
            </div>

            <div className="flex gap-2">
              <input className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Add tag" value={blogTagInput} onChange={(e) => setBlogTagInput(e.target.value)} />
              <button
                type="button"
                onClick={() => {
                  const tag = blogTagInput.trim();
                  if (tag && !blogDraft.tags.includes(tag)) {
                    setBlogDraft((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
                  }
                  setBlogTagInput('');
                }}
                className="px-3 py-2 border border-zinc-200 rounded-xl text-sm hover:bg-zinc-50"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {blogDraft.tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setBlogDraft((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }))}
                  className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs"
                >
                  {tag} x
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setBlogMode('manage')} className="px-4 py-2 text-sm border border-zinc-200 rounded-xl hover:bg-zinc-50">Manage Existing</button>
              <button type="submit" className="px-4 py-2 text-sm bg-black text-white rounded-xl hover:bg-zinc-800">{blogEditingId ? 'Update Post' : 'Publish Post'}</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Post Preview</h3>
            <div className="rounded-2xl border border-zinc-100 overflow-hidden">
              <div className="aspect-video bg-zinc-100">
                {blogPreviewType === 'video' ? (
                  <video className="w-full h-full object-cover" src={blogPreviewMedia} poster={blogDraft.image || PLACEHOLDER_MEDIA_URL} controls muted />
                ) : (
                  <img className="w-full h-full object-cover" src={blogPreviewMedia} alt="Preview" />
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs text-zinc-500">{blogDraft.category} • {blogDraft.date ? formatDate(blogDraft.date) : '-'}</p>
                <h4 className="font-bold text-zinc-900">{blogDraft.title || 'Post title'}</h4>
                <p className="text-sm text-zinc-600">{blogDraft.excerpt || 'Post excerpt preview appears here.'}</p>
              </div>
            </div>
          </div>
        </form>
      ) : null}

      {blogMode === 'manage' ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Manage Blog Posts</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm w-full md:w-60" placeholder="Search posts" value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} />
              <select className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={blogStatus} onChange={(e) => setBlogStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {postsLoading ? (
            <div className="p-8 text-sm text-zinc-500">Loading posts...</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredPosts.length ? filteredPosts.map((post) => (
                <div key={post.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">{post.title}</p>
                    <p className="text-sm text-zinc-500">{post.category} • {formatDate(post.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditBlog(post)} className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteBlog(post.id)} className="p-2 border border-rose-200 rounded-lg text-rose-500 hover:text-rose-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )) : <div className="p-8 text-sm text-zinc-500">No posts found.</div>}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const renderCredentials = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {credentialMode === 'upload' ? (
        <form className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5" onSubmit={handleSaveCredential}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">{credentialEditingId ? 'Edit Credential' : 'Upload Credential'}</h2>
            <button type="button" onClick={resetCredentialComposer} className="text-sm text-zinc-500 hover:text-black">Reset</button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Credential Type</label>
            <div className="flex flex-wrap gap-2">
              {['certificate', 'certification', 'badge'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCredentialDraft((prev) => ({ ...prev, type, badgeSource: type === 'badge' ? prev.badgeSource || 'github' : '' }))}
                  className={cn('px-3 py-1.5 rounded-xl text-sm border', credentialDraft.type === type ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50')}
                >
                  {type === 'certificate' ? 'Certificate' : type === 'certification' ? 'Certification' : 'Badge'}
                </button>
              ))}
            </div>
          </div>

          {credentialDraft.type === 'badge' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Badge Space</label>
              <div className="flex flex-wrap gap-2">
                {['github', 'other'].map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setCredentialDraft((prev) => ({ ...prev, badgeSource: source }))}
                    className={cn('px-3 py-1.5 rounded-xl text-sm border', credentialDraft.badgeSource === source ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50')}
                  >
                    {source === 'github' ? 'GitHub' : 'Other'}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Title" value={credentialDraft.title} onChange={(e) => setCredentialDraft((prev) => ({ ...prev, title: e.target.value }))} required />
            <input className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Issuer" value={credentialDraft.issuer} onChange={(e) => setCredentialDraft((prev) => ({ ...prev, issuer: e.target.value }))} required />
            <input type="date" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={credentialDraft.date} onChange={(e) => setCredentialDraft((prev) => ({ ...prev, date: e.target.value }))} required />
            <input type="url" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" placeholder="Verification URL (optional)" value={credentialDraft.verificationUrl} onChange={(e) => setCredentialDraft((prev) => ({ ...prev, verificationUrl: e.target.value }))} />
            <input type="url" className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm md:col-span-2" placeholder="Document or badge image URL (optional if attaching file below)" value={credentialDraft.fileUrl} onChange={(e) => setCredentialDraft((prev) => ({ ...prev, fileUrl: e.target.value }))} />
            <div className="md:col-span-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Attach credential document</p>
                  <p className="text-xs text-zinc-500">Upload a PDF or image file for certificates, certifications, or badges.</p>
                </div>
                <label className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-black text-white rounded-xl hover:bg-zinc-800 cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setCredentialFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                {credentialFile ? `Selected file: ${credentialFile.name}` : 'No file selected yet.'}
              </p>
            </div>
          </div>

          <textarea className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm min-h-28" placeholder="Credential description (optional)" value={credentialDraft.description} onChange={(e) => setCredentialDraft((prev) => ({ ...prev, description: e.target.value }))} />

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setCredentialMode('manage')} className="px-4 py-2 text-sm border border-zinc-200 rounded-xl hover:bg-zinc-50">Manage Existing</button>
            <button type="submit" className="px-4 py-2 text-sm bg-black text-white rounded-xl hover:bg-zinc-800">{credentialEditingId ? 'Update Credential' : 'Save Credential'}</button>
          </div>
        </form>
      ) : null}

      {credentialMode === 'manage' ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">Manage Credentials</h2>
            <p className="text-xs text-zinc-500">Sorted by issued date (newest first).</p>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <input className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm w-full md:w-72" placeholder="Search credentials" value={credentialSearch} onChange={(e) => setCredentialSearch(e.target.value)} />
              <select className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={credentialTypeFilter} onChange={(e) => setCredentialTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="certificate">Certificates</option>
                <option value="certification">Certifications</option>
                <option value="badge">Badges</option>
              </select>
              {credentialTypeFilter === 'badge' ? (
                <select className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" value={credentialBadgeFilter} onChange={(e) => setCredentialBadgeFilter(e.target.value)}>
                  <option value="all">All Badge Spaces</option>
                  <option value="github">GitHub</option>
                  <option value="other">Other</option>
                </select>
              ) : null}
            </div>
          </div>

          {credentialsLoading ? (
            <div className="p-8 text-sm text-zinc-500">Loading credentials...</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredCredentials.length ? filteredCredentials.map((credential) => (
                <div key={credential.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">{credential.title}</p>
                    <p className="text-sm text-zinc-500">
                      {credential.type || 'credential'}
                      {credential.type === 'badge' && credential.badgeSource ? ` (${credential.badgeSource})` : ''}
                      {' • '}
                      {credential.issuer || 'Unknown issuer'}
                      {' • '}
                      {formatCredentialDate(credential.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {credential.verificationUrl ? (
                      <a href={credential.verificationUrl} target="_blank" rel="noreferrer" className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black" title="Open verification link">
                        <ExternalLink size={14} />
                      </a>
                    ) : null}
                    <button onClick={() => handleEditCredential(credential)} className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteCredential(credential.id)} className="p-2 border border-rose-200 rounded-lg text-rose-500 hover:text-rose-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )) : <div className="p-8 text-sm text-zinc-500">No credentials found.</div>}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-zinc-900">Inquiries</h2>
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 text-sm text-zinc-600">
        Inbox integration is not configured yet. Connect a real contact/message backend before rendering inquiry metrics or message lists.
      </div>
    </div>
  );

  const renderAi = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">AI Assistant Logs</h2>
        <button className="px-4 py-2 text-sm font-medium bg-black text-white rounded-xl hover:bg-zinc-800">Assistant Settings</button>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm text-sm text-zinc-600">
        AI logs panel ready. Connect this section to your assistant telemetry endpoint to monitor chat usage, intents, and model health.
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-zinc-900">Settings</h2>

      <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-zinc-900">Profile</h3>
        <input type="text" defaultValue={user?.displayName || 'Agoma Divine E.'} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" />
        <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm" />
      </div>

      <form onSubmit={handleSaveFirebaseSecrets} className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Firebase Config Credentials</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Write-only mode: values are never shown after save. You can only rotate by entering a new value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIREBASE_CONFIG_FIELDS.map((field) => {
            const fieldStatus = firebaseSecretStatus[field.key];
            const configured = Boolean(fieldStatus?.configured);

            return (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={`firebase-${field.key}`} className="text-sm font-medium text-zinc-700">{field.label}</label>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', configured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200')}>
                    {configured ? 'Configured' : 'Not set'}
                  </span>
                </div>
                <input
                  id={`firebase-${field.key}`}
                  type="password"
                  value={firebaseSecrets[field.key]}
                  onChange={(e) => setFirebaseSecrets((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={configured ? 'Enter new value to rotate' : 'Enter value'}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm"
                  autoComplete="off"
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={secretsSaving} className="px-4 py-2 text-sm bg-black text-white rounded-xl hover:bg-zinc-800 disabled:opacity-60">
            {secretsSaving ? 'Saving...' : 'Save Credentials'}
          </button>
          <button type="button" onClick={loadFirebaseSecretStatus} disabled={secretsLoading} className="px-4 py-2 text-sm border border-zinc-200 rounded-xl hover:bg-zinc-50 disabled:opacity-60">
            {secretsLoading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      </form>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Secrets are intentionally non-readable after save. Admins can update values anytime, but cannot reveal current values.
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'projects':
        return renderProjects();
      case 'blog':
        return renderBlog();
      case 'credentials':
        return renderCredentials();
      case 'messages':
        return renderMessages();
      case 'ai':
        return renderAi();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transition-transform duration-300 transform lg:relative lg:translate-x-0',
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-black p-2 rounded-xl">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-zinc-900 uppercase">Dee&apos;s Admin</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />

            <SidebarItem
              icon={Briefcase}
              label="Projects"
              active={activeTab === 'projects'}
              onClick={() => {
                setActiveTab('projects');
                setProjectMode('upload');
              }}
            />
            {activeTab === 'projects' ? (
              <div className="ml-6 mt-1 mb-3 space-y-1 border-l border-zinc-200 pl-3">
                <button className={cn('text-sm block w-full text-left py-1.5', projectMode === 'upload' ? 'text-black font-semibold' : 'text-zinc-500')} onClick={() => setProjectMode('upload')}>Upload Project</button>
                <button className={cn('text-sm block w-full text-left py-1.5', projectMode === 'manage' ? 'text-black font-semibold' : 'text-zinc-500')} onClick={() => setProjectMode('manage')}>Manage Projects</button>
              </div>
            ) : null}

            <SidebarItem
              icon={Award}
              label="Credentials"
              active={activeTab === 'credentials'}
              onClick={() => {
                setActiveTab('credentials');
                setCredentialMode('upload');
              }}
            />
            {activeTab === 'credentials' ? (
              <div className="ml-6 mt-1 mb-3 space-y-1 border-l border-zinc-200 pl-3">
                <button className={cn('text-sm block w-full text-left py-1.5', credentialMode === 'upload' ? 'text-black font-semibold' : 'text-zinc-500')} onClick={() => setCredentialMode('upload')}>Upload Credential</button>
                <button className={cn('text-sm block w-full text-left py-1.5', credentialMode === 'manage' ? 'text-black font-semibold' : 'text-zinc-500')} onClick={() => setCredentialMode('manage')}>Manage Credentials</button>
              </div>
            ) : null}

            <SidebarItem
              icon={FileText}
              label="Blog Posts"
              active={activeTab === 'blog'}
              onClick={() => {
                setActiveTab('blog');
                setBlogMode('compose');
              }}
            />
            {activeTab === 'blog' ? (
              <div className="ml-6 mt-1 mb-3 space-y-1 border-l border-zinc-200 pl-3">
                <button className={cn('text-sm block w-full text-left py-1.5', blogMode === 'compose' ? 'text-black font-semibold' : 'text-zinc-500')} onClick={() => setBlogMode('compose')}>Compose Post</button>
                <button className={cn('text-sm block w-full text-left py-1.5', blogMode === 'manage' ? 'text-black font-semibold' : 'text-zinc-500')} onClick={() => setBlogMode('manage')}>Manage Posts</button>
              </div>
            ) : null}

            <SidebarItem icon={MessageSquare} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
            <SidebarItem icon={BrainCircuit} label="AI Assistant" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />

            <div className="pt-4 mt-4 border-t border-zinc-100">
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                <User size={20} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 truncate">{user?.displayName || 'Agoma Divine E.'}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email || 'Admin Account'}</p>
              </div>
              <button onClick={handleSignOut} className="text-zinc-400 hover:text-rose-600 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Search anything..." className="pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-black/5 transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-zinc-200"></div>
            <button onClick={handleSignOut} className="border border-zinc-200 rounded-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              Sign Out
            </button>
          </div>
        </header>

        <div ref={contentScrollRef} className="flex-1 overflow-y-auto p-6 lg:p-10">
          {flash.message ? (
            <div className={cn('mb-5 px-4 py-3 rounded-xl text-sm border', flash.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')}>
              {flash.message}
            </div>
          ) : null}
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}
