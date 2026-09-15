export const HOME_SECTION_IDS = ['home', 'about', 'achievements', 'projects', 'skills', 'contact'];

const HOME_SECTION_ID_SET = new Set(HOME_SECTION_IDS);
const DEFAULT_FALLBACK_OFFSET = 72;
const DEFAULT_EXTRA_OFFSET = 10;

function getSectionAnchor(section) {
  if (!section) {
    return null;
  }

  const anchorSelector = section.dataset.scrollAnchor;
  return anchorSelector ? section.querySelector(anchorSelector) || section : section;
}

export function normalizeHomeSectionId(sectionId) {
  if (typeof sectionId !== 'string') {
    return '';
  }

  const normalized = sectionId.trim().toLowerCase();
  return HOME_SECTION_ID_SET.has(normalized) ? normalized : '';
}

export function getNavbarClearance(options = {}) {
  const { fallbackOffset = DEFAULT_FALLBACK_OFFSET, extraOffset = DEFAULT_EXTRA_OFFSET } = options;
  const navbar = document.getElementById('navbar');
  let navbarHeight = fallbackOffset;

  if (navbar) {
    const isAtPageTop = window.scrollY <= 1;
    const isScrolled = navbar.classList.contains('scrolled');

    // The compact navbar is the state users see immediately after a section
    // jump. Measure that state when a click starts from the expanded top bar.
    if (isAtPageTop && !isScrolled) {
      const previousTransition = navbar.style.transition;
      navbar.style.transition = 'none';
      navbar.classList.add('scrolled');
      navbarHeight = Math.round(navbar.getBoundingClientRect().height);
      navbar.classList.remove('scrolled');
      navbar.style.transition = previousTransition;
    } else {
      navbarHeight = Math.round(navbar.getBoundingClientRect().height);
    }
  }

  return navbarHeight + extraOffset;
}

export function getActiveHomeSectionId(options = {}) {
  const {
    fallbackId = HOME_SECTION_IDS[0],
    referenceOffset = 24
  } = options;

  const sections = HOME_SECTION_IDS
    .map((sectionId) => ({
      id: sectionId,
      element: getSectionAnchor(document.getElementById(sectionId))
    }))
    .filter(({ element }) => Boolean(element));

  if (!sections.length) {
    return fallbackId;
  }

  const referenceY = window.scrollY + getNavbarClearance(options) + referenceOffset;
  let current = fallbackId;

  sections.forEach(({ id, element }) => {
    const sectionTop = window.scrollY + element.getBoundingClientRect().top;

    if (referenceY >= sectionTop) {
      current = id;
    }
  });

  return current;
}

export function scrollToSectionById(sectionId, options = {}) {
  const normalizedSectionId = normalizeHomeSectionId(sectionId) || sectionId;
  const section = document.getElementById(normalizedSectionId);
  const behavior = options.behavior || 'smooth';

  if (!section) {
    return false;
  }

  const anchor = getSectionAnchor(section);
  let targetTop = window.scrollY + anchor.getBoundingClientRect().top - getNavbarClearance(options);

  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampedTop = Math.min(Math.max(0, targetTop), maxScrollTop);

  window.scrollTo({
    top: clampedTop,
    behavior,
  });

  return true;
}
