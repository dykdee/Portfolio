import { normalizeHomeSectionId, scrollToSectionById } from './scrollToSection';

export const CANONICAL_HOME_PATH = '/';
export const BLOG_PATH = '/blog';

export const SCROLL_INTENT_ROUTE_TOP = 'route-top';
export const SCROLL_INTENT_HOME_SECTION = 'home-section';

function createRouteTopIntent() {
  return { type: SCROLL_INTENT_ROUTE_TOP };
}

function createHomeSectionIntent(sectionId) {
  const target = normalizeHomeSectionId(sectionId);

  if (!target) {
    return null;
  }

  return {
    type: SCROLL_INTENT_HOME_SECTION,
    target
  };
}

function normalizeScrollIntent(scrollIntent) {
  if (!scrollIntent || typeof scrollIntent !== 'object') {
    return null;
  }

  if (scrollIntent.type === SCROLL_INTENT_ROUTE_TOP) {
    return createRouteTopIntent();
  }

  if (scrollIntent.type === SCROLL_INTENT_HOME_SECTION) {
    return createHomeSectionIntent(scrollIntent.target);
  }

  return null;
}

function stripScrollIntentState(state) {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const nextState = { ...state };
  delete nextState.scrollIntent;

  return Object.keys(nextState).length ? nextState : null;
}

export function scrollPageToTop(options = {}) {
  const behavior = options.behavior || 'smooth';

  window.scrollTo({
    top: 0,
    behavior
  });

  return true;
}

export function getScrollIntent(location) {
  const stateIntent = normalizeScrollIntent(location?.state?.scrollIntent);
  if (stateIntent) {
    return stateIntent;
  }

  const hashTarget = normalizeHomeSectionId(location?.hash?.slice(1));
  if (hashTarget) {
    return createHomeSectionIntent(hashTarget);
  }

  return null;
}

export function getPendingHomeSection(location) {
  const scrollIntent = getScrollIntent(location);

  if (scrollIntent?.type !== SCROLL_INTENT_HOME_SECTION) {
    return '';
  }

  return scrollIntent.target;
}

export function clearScrollIntent({ location, navigate }) {
  const scrollIntent = normalizeScrollIntent(location?.state?.scrollIntent);

  if (!scrollIntent) {
    return false;
  }

  navigate(
    {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    },
    {
      replace: true,
      state: stripScrollIntentState(location.state)
    }
  );

  return true;
}

export function navigateToHomeSection({ sectionId, location, navigate, replace = false }) {
  const scrollIntent = createHomeSectionIntent(sectionId);

  if (!scrollIntent) {
    return false;
  }

  if (location.pathname === CANONICAL_HOME_PATH) {
    return scrollToSectionById(scrollIntent.target);
  }

  navigate(CANONICAL_HOME_PATH, {
    replace,
    state: { scrollIntent }
  });

  return true;
}

export function navigateToBlogTop({ location, navigate, replace = false }) {
  if (location.pathname === BLOG_PATH) {
    return scrollPageToTop();
  }

  navigate(BLOG_PATH, {
    replace,
    state: {
      scrollIntent: createRouteTopIntent()
    }
  });

  return true;
}
