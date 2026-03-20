import { useEffect, useState } from 'react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { createMediaPlaceholderUrl, formatDate } from '../../utils/blogUtils';
import '../../../styles.css';

function determineMediaTypeFromUrl(url) {
  if (!url) return 'image';
  const normalized = url.split('?')[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(normalized) ? 'video' : 'image';
}

function inlineCodeMarkup(value) {
  return (value || '').replace(/`([^`]+)`/g, '<code>$1</code>');
}

export default function Blog() {
  const { posts, loading } = useBlogPosts();
  const [filterCategory, setFilterCategory] = useState('all');
  const [modalPost, setModalPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    document.title = 'Blog - Dee';

    const onScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredPosts = filterCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === filterCategory);

  const openModal = (post) => {
    setModalPost(post);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalPost(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const renderMedia = (post) => {
    const placeholder = createMediaPlaceholderUrl({
      label: post.title || 'Blog Post',
      width: 400,
      height: 250
    });
    const url = post.mediaUrl || post.image || placeholder;
    const mediaType = post.mediaType || determineMediaTypeFromUrl(url);
    if (mediaType === 'video') {
      return (
        <div className="blog-card-media">
          <video src={url} poster={post.image || placeholder} muted loop playsInline preload="metadata" controls />
        </div>
      );
    }
    return (
      <div className="blog-card-media">
        <img src={url} alt={post.title || 'Blog post'} loading="lazy" onError={(e) => { e.target.src = placeholder; }} />
      </div>
    );
  };

  return (
    <>
      <nav className={`navbar blog-navbar${navScrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container">
          <div className="nav-brand">
            <a href="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>Dee</a>
          </div>

          <ul className={`nav-menu${menuOpen ? ' active' : ''}`} id="nav-menu">
            <li><a href="/home#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="/home#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="/home#projects" className="nav-link" onClick={() => setMenuOpen(false)}>Projects</a></li>
            <li><a href="/home#skills" className="nav-link" onClick={() => setMenuOpen(false)}>Skills</a></li>
            <li><a href="/blog" className="nav-link active" onClick={() => setMenuOpen(false)}>Blog</a></li>
            <li><a href="/home#contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</a></li>
          </ul>

          <div
            className={`hamburger${menuOpen ? ' open' : ''}`}
            id="hamburger"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setMenuOpen((value) => !value);
              }
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Blog Hero Section */}
      <section className="blog-hero">
        <div className="hero-content">
          <div className="hero-logo-container">
            <div className="hero-logo">D</div>
          </div>
          <div className="hero-text-wrapper">
            <p className="hero-intro-text">Thoughts on development, technology, and engineering</p>
          </div>
          <div className="hero-social-icons">
            <a href="https://github.com/dykdee" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="https://x.com/dyk_dee" target="_blank" rel="noopener noreferrer" className="social-icon" title="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"></path>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/divine-agoma-938367230/" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Blog Sidebar & Posts */}
      <section className="blog-section">
        <div className="container blog-container">
          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="sidebar-widget categories-widget">
              <h3 className="widget-title">Categories</h3>
              <ul className="categories-list">
                {['all', 'tutorials', 'projects', 'tips'].map((cat) => (
                  <li key={cat}>
                    <a
                      href="#"
                      className={`category-link${filterCategory === cat ? ' active' : ''}`}
                      onClick={(e) => { e.preventDefault(); setFilterCategory(cat); }}
                    >
                      {cat === 'all' ? 'All Posts' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget tags-widget">
              <h3 className="widget-title">Popular Tags</h3>
              <div className="tags-cloud">
                {['JavaScript', 'React', 'Web Development', 'CSS', 'Backend', 'AI/ML', 'Performance', 'DevOps'].map((tag) => (
                  <a href="#" key={tag} className="tag-link" onClick={(e) => e.preventDefault()}>{tag}</a>
                ))}
              </div>
            </div>

            <div className="sidebar-widget newsletter-widget">
              <h3 className="widget-title">Subscribe</h3>
              <p>Get notified of new posts</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email" required />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </aside>

          {/* Posts Grid */}
          <main className="blog-posts">
            <div className="posts-grid" id="posts-grid">
              {loading && <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading posts...</p>}
              {!loading && filteredPosts.length === 0 && (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No posts found.</p>
              )}
              {filteredPosts.map((post) => (
                <article key={post.id} className="blog-card">
                  {renderMedia(post)}
                  <div className="blog-card-content">
                    <div className="post-meta">
                      <span className="post-author">{post.author || ''}</span>
                      <span className="post-date">{formatDate(post.date || post.publishedAt || post.createdAt)}</span>
                      <span className="post-category">{post.category || ''}</span>
                    </div>
                    <h3 className="blog-card-title" dangerouslySetInnerHTML={{ __html: inlineCodeMarkup(post.title) }} />
                    <p className="blog-card-excerpt" dangerouslySetInnerHTML={{ __html: inlineCodeMarkup(post.excerpt) }} />
                    <div className="blog-card-tags">
                      {(post.tags || []).map((tag) => (
                        <a href="#" key={tag} className="post-tag" onClick={(e) => e.preventDefault()}>{tag}</a>
                      ))}
                    </div>
                    <a href="#" className="read-more" onClick={(e) => { e.preventDefault(); openModal(post); }}>Read More →</a>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </section>

      {/* Post Detail Modal */}
      {modalPost && (
        <div className="post-modal" style={{ display: 'flex' }}>
          <div className="post-modal-overlay" onClick={closeModal}></div>
          <div className="post-modal-content">
            <button className="post-modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            <article className="post-full">
              {renderMedia(modalPost)}
              <div className="post-full-header">
                <div className="post-meta">
                  <span className="post-author">{modalPost.author || ''}</span>
                  <span className="post-date">{formatDate(modalPost.date || modalPost.publishedAt || modalPost.createdAt)}</span>
                  <span className="post-category">{modalPost.category || ''}</span>
                </div>
                <h1 className="post-full-title" dangerouslySetInnerHTML={{ __html: inlineCodeMarkup(modalPost.title) }} />
                <div className="post-full-tags">
                  {(modalPost.tags || []).map((tag) => (
                    <span key={tag} className="post-modal-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="post-full-content" dangerouslySetInnerHTML={{ __html: inlineCodeMarkup(modalPost.content || modalPost.excerpt) }} />
            </article>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <p className="footer-name">Agoma Divine E.</p>
            <p className="footer-tagline">LLM Engineer & Full Stack Developer</p>
          </div>
          <div className="footer-links" aria-label="Social links">
            <a className="footer-link" href="https://github.com/dykdee" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a className="footer-link" href="https://www.linkedin.com/in/divine-agoma-938367230/" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a className="footer-link" href="mailto:deedexanalyst@gmail.com">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Email
            </a>
          </div>
          <p className="footer-copy">&copy; 2026 Agoma Divine E.</p>
        </div>
      </footer>
    </>
  );
}
