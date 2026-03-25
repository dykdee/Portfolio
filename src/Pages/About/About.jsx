import { useEffect, useRef, useState } from 'react';
import './About.css';

const RESUME_DATA = {
  id: 'resume-1',
  title: 'My Resume',
  fileUrl: '/media/Files/MyResume.pdf',
  fileType: 'pdf',
};

const CODE_LINES = [
  '<span class="keyword">const</span> <span class="variable">developer</span> <span class="operator">=</span> {',
  '  <span class="variable">name</span>: <span class="string">\'Dee\'</span>,',
  '  <span class="variable">role</span>: <span class="string">\'AI Product & Systems Engineer\'</span>,',
  '  <span class="variable">skills</span>: [<span class="string">\'JavaScript\'</span>, <span class="string">\'React\'</span>, <span class="string">\'Python\'</span>, <span class="string">\'Docker\'</span>, <span class="string">\'Node.js\'</span>],',
  '  <span class="function">build</span>() {',
  '    <span class="keyword">return</span> <span class="string">\'Amazing Products\'</span>;',
  '  }',
  '};',
  '<span class="comment">// Passionate about creating elegant solutions</span>',
];

export default function About() {
  const lineRefs   = useRef([]);
  const animRef    = useRef({ started: false, line: 0, char: 0 });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  function closeResumeModal() {
    setResumeModalOpen(false);
  }

  useEffect(() => {
    const container = document.querySelector('.code-animation-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animRef.current.started) {
            animRef.current.started = true;
            startTyping();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && resumeModalOpen) {
        closeResumeModal();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [resumeModalOpen]);

  useEffect(() => {
    document.body.style.overflow = resumeModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [resumeModalOpen]);

  // Close modal if user attempts to scroll the page while it is open.
  useEffect(() => {
    if (!resumeModalOpen) return;

    const onScrollIntent = () => {
      closeResumeModal();
    };

    window.addEventListener('wheel', onScrollIntent, { passive: true, capture: true });
    window.addEventListener('touchmove', onScrollIntent, { passive: true, capture: true });
    window.addEventListener('scroll', onScrollIntent, { passive: true, capture: true });

    return () => {
      window.removeEventListener('wheel', onScrollIntent, { capture: true });
      window.removeEventListener('touchmove', onScrollIntent, { capture: true });
      window.removeEventListener('scroll', onScrollIntent, { capture: true });
    };
  }, [resumeModalOpen]);

  function startTyping() {
    const els = lineRefs.current;
    animRef.current.line = 0;
    animRef.current.char = 0;

    function type() {
      const { line, char } = animRef.current;
      if (line >= CODE_LINES.length) {
        setTimeout(() => {
          els.forEach((el) => { if (el) el.innerHTML = ''; });
          animRef.current = { started: true, line: 0, char: 0 };
          startTyping();
        }, 5000);
        return;
      }

      const el = els[line];
      if (!el) {
        animRef.current.line += 1;
        animRef.current.char  = 0;
        setTimeout(type, 100);
        return;
      }

      const target  = CODE_LINES[line];
      const preview = target.substring(0, char);
      el.innerHTML  = preview + '<span class="code-cursor"></span>';

      if (char < target.length) {
        animRef.current.char += 1;
        setTimeout(type, 30 + Math.random() * 40);
      } else {
        el.innerHTML = preview;
        animRef.current.line += 1;
        animRef.current.char  = 0;
        setTimeout(type, 200);
      }
    }

    setTimeout(type, 500);
  }

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              I’m an engineer driven by the challenge of turning complexity into clarity, building systems that not only work but also solve meaningful problems.< br />Whether it’s designing scalable products, integrating AI capabilities, or improving how software performs in real-world environments, I focus on delivering practical value.
            </p>
            <p>
              When I'm not coding, I'm exploring new technologies, studying how intelligent systems evolve, contributing to open-source projects, or sharing knowledge with the developer community.
            </p>

            <div className="about-stats-wrapper">
              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Projects Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">2+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Client Satisfaction</div>
                </div>
              </div>

              <div className="resume-view-container">
                <button
                  type="button"
                  className="btn-resume"
                  onClick={() => setResumeModalOpen(true)}
                  aria-label="View resume"
                >
                  <svg className="view-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>View Resume</span>
                </button>
              </div>
            </div>
          </div>

          <div className="code-animation-container">
            <div className="code-editor">
              <div className="code-header">
                <div className="code-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <span className="code-title">portfolio.js</span>
              </div>
              <div className="code-body">
                {CODE_LINES.map((_, i) => (
                  <pre key={i} className="code-line">
                    <span className="code-line-number">{i + 1}</span>
                    <span
                      className="code-content"
                      id={`code-line-${i + 1}`}
                      ref={(el) => { lineRefs.current[i] = el; }}
                    ></span>
                  </pre>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {resumeModalOpen && (
        <div
          className="resume-modal-backdrop is-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeResumeModal();
            }
          }}
        >
          <div className="resume-modal-box">
            <div className="resume-modal-header">
              <div>
                <h3 className="resume-modal-title" id="resume-modal-title">My Resume</h3>
                <p className="resume-modal-subtitle">Protected View</p>
              </div>
              <button
                className="resume-modal-close"
                onClick={closeResumeModal}
                aria-label="Close resume preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="resume-modal-content">
              <div className="resume-security-notice">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Protected View: Downloads and printing are restricted.
              </div>

              <div className="resume-viewer-wrap" onContextMenu={(e) => e.preventDefault()}>
                <iframe
                  src={`${RESUME_DATA.fileUrl}#page=1&view=Fit&zoom=page-fit&toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                  title={`${RESUME_DATA.title} PDF preview`}
                  loading="lazy"
                  scrolling="no"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
