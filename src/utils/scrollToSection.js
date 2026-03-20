export function scrollToSectionById(sectionId, options = {}) {
  const { fallbackOffset = 70, extraOffset = 8 } = options;
  const section = document.getElementById(sectionId);

  if (!section) {
    return false;
  }

  const navbar = document.getElementById('navbar');
  const navbarHeight = navbar ? Math.round(navbar.getBoundingClientRect().height) : fallbackOffset;
  const targetTop = window.scrollY + section.getBoundingClientRect().top - navbarHeight - extraOffset;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: 'smooth',
  });

  return true;
}
