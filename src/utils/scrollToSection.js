export const HOME_SECTION_IDS = ['home', 'about', 'projects', 'skills', 'contact'];

const HOME_SECTION_ID_SET = new Set(HOME_SECTION_IDS);
const DEFAULT_FALLBACK_OFFSET = 72;
const DEFAULT_EXTRA_OFFSET = 10;

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
  const navbarHeight = navbar ? Math.round(navbar.getBoundingClientRect().height) : fallbackOffset;

  return navbarHeight + extraOffset;
}

export function getActiveHomeSectionId(options = {}) {
  const {
    fallbackId = HOME_SECTION_IDS[0],
    referenceOffset = 24
  } = options;

  const sections = HOME_SECTION_IDS
    .map((sectionId) => document.getElementById(sectionId))
    .filter(Boolean);

  if (!sections.length) {
    return fallbackId;
  }

  const referenceY = window.scrollY + getNavbarClearance(options) + referenceOffset;
  let current = fallbackId;

  sections.forEach((section) => {
    if (referenceY >= section.offsetTop) {
      current = section.id;
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

  const targetTop = window.scrollY + section.getBoundingClientRect().top - getNavbarClearance(options);

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  });

  return true;
}
