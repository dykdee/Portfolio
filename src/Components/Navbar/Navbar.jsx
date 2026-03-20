import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { scrollToSectionById } from '../../utils/scrollToSection';
import './Navbar.css';

const NAV_LINKS = [
  { id: 'home',     label: 'Home' },
  { id: 'about',    label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills',   label: 'Skills' },
  { id: null,       label: 'Blog', href: '/blog' },
  { id: 'contact',  label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeId, setActiveId]   = useState('home');
  const location = useLocation();
  const isHomeRoute = location.pathname === '/' || location.pathname === '/home';
  const isBlogRoute = location.pathname === '/blog';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);

      if (!isHomeRoute) {
        return;
      }

      // Active section highlighting
      const sections = document.querySelectorAll('section[id]');
      let current = 'home';
      sections.forEach((section) => {
        const top    = section.offsetTop - 80;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
          current = section.id;
        }
      });
      setActiveId(current);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomeRoute]);

  function scrollToSection(id) {
    scrollToSectionById(id);
    setMenuOpen(false);
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="container">
        <div className="nav-brand">
          <Link to="/home" onClick={() => setMenuOpen(false)} aria-label="Go to home page">
            <img src="/media/dee_logo_white.png" alt="Dee Logo" className="nav-logo" />
          </Link>
        </div>

        <ul className={`nav-menu${menuOpen ? ' active' : ''}`} id="nav-menu">
          {NAV_LINKS.map((link) =>
            link.href ? (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={`nav-link${isBlogRoute && link.href === '/blog' ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ) : (
              <li key={link.id}>
                {isHomeRoute ? (
                  <button
                    className={`nav-link${activeId === link.id ? ' active' : ''}`}
                    onClick={() => scrollToSection(link.id)}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link to={`/home#${link.id}`} className="nav-link" onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                )}
              </li>
            )
          )}
        </ul>

        <div
          className={`hamburger${menuOpen ? ' open' : ''}`}
          id="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
