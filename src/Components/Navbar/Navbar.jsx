import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navigateToBlogTop, navigateToHomeSection } from '../../utils/homeNavigation';
import { getActiveHomeSectionId } from '../../utils/scrollToSection';
import './Navbar.css';

const NAV_LINKS = [
  { id: 'home',     label: 'Home' },
  { id: 'about',    label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills',   label: 'Skills' },
  { id: 'blog',     label: 'Blog' },
  { id: 'contact',  label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeId, setActiveId]   = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const isHomeRoute = location.pathname === '/';
  const isBlogRoute = location.pathname === '/blog';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);

      if (!isHomeRoute) {
        return;
      }

      setActiveId(getActiveHomeSectionId());
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomeRoute]);

  function scrollToSection(id) {
    navigateToHomeSection({ sectionId: id, location, navigate });
    setMenuOpen(false);
  }

  function goToBlogTop() {
    navigateToBlogTop({ location, navigate });
    setMenuOpen(false);
  }

  function goToHomeTop(event) {
    event.preventDefault();
    navigateToHomeSection({ sectionId: 'home', location, navigate });
    setMenuOpen(false);
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="container">
        <div className="nav-brand">
          <Link to="/" onClick={goToHomeTop} aria-label="Go to home page">
            <img src="/media/dee_logo_white.png" alt="Dee Logo" className="nav-logo" />
          </Link>
        </div>

        <ul className={`nav-menu${menuOpen ? ' active' : ''}`} id="nav-menu">
          {NAV_LINKS.map((link) =>
            link.id === 'blog' ? (
              <li key={link.label}>
                <button
                  type="button"
                  className={`nav-link${isBlogRoute ? ' active' : ''}`}
                  onClick={goToBlogTop}
                >
                  {link.label}
                </button>
              </li>
            ) : (
              <li key={link.id}>
                <button
                  type="button"
                  className={`nav-link${isHomeRoute && activeId === link.id ? ' active' : ''}`}
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.label}
                </button>
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
