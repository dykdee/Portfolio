import { useState, useEffect, useRef, useCallback } from 'react';
import { usePortfolioCredentials } from '../../hooks/useBlogPosts';
import './Credentials.css';

const CERT_DATA = [
  {
    id: 'cert-1',
    title: 'Claude Code in Action',
    issuer: 'Anthropic',
    date: 'Mar 2026',
    type: 'certificate',
    description:
      'Hands-on certificate demonstrating proficiency with Claude Code and AI-assisted software engineering workflows.',
    fileUrl: '/media/Files/Claude Code in Action Cert.pdf',
    fileType: 'pdf',
  },
  // Add more entries here:
  // { id: 'cert-2', title: '...', issuer: '...', date: '...', type: 'certificate', description: '...', fileUrl: '...', fileType: 'image' },
  // { id: 'crtf-1', title: '...', issuer: '...', date: '...', type: 'certification', ... },
  // { id: 'badge-1', title: '...', issuer: 'GitHub', date: '...', type: 'badge', badgeSource: 'github', ... },
];

const ICON = {
  award: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  graduation: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  eye: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  chevronRight: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  externalLink: (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  badge: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 11 2-2-2-2"/>
      <path d="M11 13h4"/>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  ),
};

function formatCredentialDate(value) {
  if (!value) {
    return '';
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

export default function Credentials() {
  const { credentials, loading, error } = usePortfolioCredentials();
  const [activeTab,   setActiveTab]   = useState('certificate');
  const [badgeSource, setBadgeSource] = useState('github');
  const [modalItem,   setModalItem]   = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [visibleIds,  setVisibleIds]  = useState(new Set());
  const indicatorRef  = useRef(null);
  const tabBtnsRef    = useRef({});

  const records = credentials.length ? credentials : CERT_DATA;
  const showingFallback = !credentials.length && Boolean(error);

  const filteredItems = records.filter((item) => {
    if (item.type !== activeTab) {
      return false;
    }

    if (activeTab !== 'badge') {
      return true;
    }

    return (item.badgeSource || 'other') === badgeSource;
  });

  const displayedItems = filteredItems.slice(0, 4);
  const displayedItemsKey = displayedItems.map((item) => item.id).join('|');

  // Position the sliding tab indicator
  const positionIndicator = useCallback(() => {
    const btn = tabBtnsRef.current[activeTab];
    const ind = indicatorRef.current;
    if (!btn || !ind) return;
    ind.style.left  = btn.offsetLeft + 'px';
    ind.style.width = btn.offsetWidth + 'px';
  }, [activeTab]);

  useEffect(() => {
    requestAnimationFrame(positionIndicator);
    window.addEventListener('resize', positionIndicator);
    return () => window.removeEventListener('resize', positionIndicator);
  }, [positionIndicator]);

  // Staggered card entrance
  useEffect(() => {
    const timers = [];
    setVisibleIds(new Set());
    displayedItems.forEach((item, i) => {
      const timer = setTimeout(() => {
        setVisibleIds((prev) => new Set([...prev, item.id]));
      }, i * 80 + 50);
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [activeTab, displayedItemsKey]);

  // Keyboard escape closes modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && modalOpen) closeModal();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  // Close modal if user attempts to scroll the page while it is open.
  useEffect(() => {
    if (!modalOpen) return;

    const onScrollIntent = () => {
      closeModal();
    };

    window.addEventListener('wheel', onScrollIntent, { passive: true, capture: true });
    window.addEventListener('touchmove', onScrollIntent, { passive: true, capture: true });
    window.addEventListener('scroll', onScrollIntent, { passive: true, capture: true });

    return () => {
      window.removeEventListener('wheel', onScrollIntent, { capture: true });
      window.removeEventListener('touchmove', onScrollIntent, { capture: true });
      window.removeEventListener('scroll', onScrollIntent, { capture: true });
    };
  }, [modalOpen]);

  function openModal(item) {
    setModalItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setTimeout(() => setModalItem(null), 300);
  }

  function switchTab(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab !== 'badge') {
      setBadgeSource('github');
    }
  }

  return (
    <section id="credentials" className="creds-section">
      <div className="container">
        <div className="creds-header">
          <div className="creds-header-text">
            <span className="creds-eyebrow">Professional Growth</span>
            <h2 className="creds-title">
              Credentials &amp; <span className="creds-title-muted">Expertise</span>
            </h2>
          </div>

          {/* Tab Toggle Pill */}
          <div className="creds-toggle-pill" role="tablist" aria-label="Credential categories">
            {['certificate', 'certification', 'badge'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`creds-tab-btn${activeTab === tab ? ' is-active' : ''}`}
                role="tab"
                aria-selected={activeTab === tab}
                data-tab={tab}
                ref={(el) => { tabBtnsRef.current[tab] = el; }}
                onClick={() => switchTab(tab)}
              >
                {tab === 'certificate' ? ICON.award : tab === 'certification' ? ICON.graduation : ICON.badge}
                {tab === 'certificate' ? 'Certificates' : tab === 'certification' ? 'Certifications' : 'Badges'}
              </button>
            ))}
            <span ref={indicatorRef} className="creds-tab-indicator" aria-hidden="true" />
          </div>

          {activeTab === 'badge' ? (
            <div className="creds-toggle-pill" role="tablist" aria-label="Badge spaces">
              {['github', 'other'].map((source) => (
                <button
                  key={source}
                  type="button"
                  className={`creds-tab-btn${badgeSource === source ? ' is-active' : ''}`}
                  onClick={() => setBadgeSource(source)}
                >
                  {source === 'github' ? ICON.github : ICON.badge}
                  {source === 'github' ? 'GitHub' : 'Other Tech Spaces'}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="creds-empty">
            <p>Loading records...</p>
          </div>
        ) : showingFallback ? (
          <>
            <div className="creds-empty">
              <p>Live credentials are unavailable right now. Showing fallback records.</p>
            </div>
            {displayedItems.length ? (
              <div className="creds-grid" role="list">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`creds-card${visibleIds.has(item.id) ? ' is-visible' : ''}`}
                    role="listitem"
                  >
                    <div className="creds-card-top">
                      <div className="creds-card-icon">
                        {item.type === 'badge' && item.fileUrl
                          ? <img src={item.fileUrl} alt={item.title} className="creds-badge-img" />
                          : item.type === 'certificate' ? ICON.award : item.type === 'certification' ? ICON.graduation : ICON.badge}
                      </div>
                      <span className="creds-card-date">{formatCredentialDate(item.date)}</span>
                    </div>
                    <h3 className="creds-card-title">{item.title}</h3>
                    <p className="creds-card-issuer">Issued by {item.issuer}</p>
                    {item.description ? <p className="creds-card-desc">{item.description}</p> : null}
                    <div className="creds-card-footer">
                      {item.type !== 'badge' && item.fileUrl ? (
                        <button
                          className="creds-view-btn"
                          type="button"
                          onClick={() => openModal(item)}
                        >
                          {ICON.eye}
                          View Document
                          {ICON.chevronRight}
                        </button>
                      ) : null}
                      {item.verificationUrl ? (
                        <a className="creds-view-btn" href={item.verificationUrl} target="_blank" rel="noreferrer">
                          {ICON.externalLink}
                          Verify Credential
                          {ICON.chevronRight}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : filteredItems.length === 0 ? (
          <div className="creds-empty">
            <p>No records found for this category.</p>
          </div>
        ) : (
          <div className="creds-grid" role="list">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className={`creds-card${visibleIds.has(item.id) ? ' is-visible' : ''}`}
                role="listitem"
              >
                <div className="creds-card-top">
                  <div className="creds-card-icon">
                    {item.type === 'badge' && item.fileUrl
                      ? <img src={item.fileUrl} alt={item.title} className="creds-badge-img" />
                      : item.type === 'certificate' ? ICON.award : item.type === 'certification' ? ICON.graduation : ICON.badge}
                  </div>
                  <span className="creds-card-date">{formatCredentialDate(item.date)}</span>
                </div>
                <h3 className="creds-card-title">{item.title}</h3>
                <p className="creds-card-issuer">Issued by {item.issuer}</p>
                {item.description ? <p className="creds-card-desc">{item.description}</p> : null}
                <div className="creds-card-footer">
                  {item.type !== 'badge' && item.fileUrl ? (
                    <button
                      className="creds-view-btn"
                      type="button"
                      onClick={() => openModal(item)}
                    >
                      {ICON.eye}
                      View Document
                      {ICON.chevronRight}
                    </button>
                  ) : null}
                  {item.verificationUrl ? (
                    <a className="creds-view-btn" href={item.verificationUrl} target="_blank" rel="noreferrer">
                      {ICON.externalLink}
                      Verify Credential
                      {ICON.chevronRight}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalItem && (
        <div
          className={`cert-modal-backdrop${modalOpen ? ' is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="cert-modal-box">
            <div className="cert-modal-header">
              <div>
                <h3 className="cert-modal-title" id="cert-modal-title">{modalItem.title}</h3>
                <p className="cert-modal-subtitle">{modalItem.issuer} &bull; {formatCredentialDate(modalItem.date)}</p>
              </div>
              <button className="cert-modal-close" onClick={closeModal} aria-label="Close modal">
                {ICON.close}
              </button>
            </div>

            <div className="cert-modal-content">
              <div className="cert-security-notice">
                {ICON.shield}
                Protected View: Downloads and printing are restricted.
              </div>
              <div
                className="cert-viewer-wrap"
                onContextMenu={(e) => e.preventDefault()}
              >
                {modalItem.fileType === 'image' ? (
                  <img
                    src={modalItem.fileUrl}
                    alt={modalItem.title}
                    referrerPolicy="no-referrer"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <iframe
                    src={`${modalItem.fileUrl}#page=1&view=Fit&zoom=page-fit&toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                    title={`${modalItem.title} PDF preview`}
                    loading="lazy"
                    scrolling="no"
                  />
                )}
              </div>
            </div>

            {modalItem.description ? (
              <div className="cert-modal-footer">
                <p className="cert-modal-desc">{modalItem.description}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
