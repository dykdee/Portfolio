import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoadingScreen from './Components/LoadingScreen';
import { CANONICAL_HOME_PATH, getScrollIntent } from './utils/homeNavigation';

// Keep the home route in the initial bundle so the portfolio hero renders
// immediately instead of showing the old loading splash first.
import Portfolio from './Pages/Portfolio/Portfolio';
const Blog = lazy(() => import('./Pages/Blog/Blog'));
const Admin = lazy(() => import('./Pages/Admin/Admin'));

function HomeAliasRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollIntent = getScrollIntent(location);

    navigate(CANONICAL_HOME_PATH, {
      replace: true,
      ...(scrollIntent ? { state: { scrollIntent } } : {})
    });
  }, [location, navigate]);

  return null;
}

function waitForImage(image) {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });
}

function waitForVideo(video) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    video.addEventListener('loadeddata', resolve, { once: true });
    video.addEventListener('error', resolve, { once: true });
    video.load();
  });
}

async function preloadLandingPage(setProgress) {
  await new Promise((resolve) => window.requestAnimationFrame(resolve));

  const images = Array.from(document.images);
  const videos = Array.from(document.querySelectorAll('video'));
  const resources = [...images, ...videos];
  const resourceCount = resources.length + 1;
  let completedResources = 0;

  const reportResourceProgress = () => {
    completedResources += 1;
    setProgress(8 + (completedResources / resourceCount) * 86);
  };

  const resourcePromises = resources.map((resource) => {
    const promise = resource instanceof HTMLImageElement
      ? waitForImage(resource)
      : waitForVideo(resource);

    return promise.then(reportResourceProgress);
  });

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  await Promise.all([...resourcePromises, fontsReady.then(reportResourceProgress)]);
  setProgress(100);
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const revealWhenReady = async () => {
      const startedAt = performance.now();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const minimumLoaderDuration = prefersReducedMotion ? 1450 : 1700;

      setLoadingProgress(4);
      await preloadLandingPage((nextProgress) => {
        if (!cancelled) {
          setLoadingProgress(nextProgress);
        }
      });

      if (cancelled) return;

      setLoadingProgress(100);

      const remainingLoaderTime = Math.max(0, minimumLoaderDuration - (performance.now() - startedAt));
      await new Promise((resolve) => window.setTimeout(resolve, remainingLoaderTime));

      if (!cancelled) {
        setShowIntro(false);
      }
    };

    revealWhenReady();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthProvider>
      <div className={`app-preload-layer${showIntro ? ' is-preloading' : ''}`}>
        <Suspense fallback={<LoadingScreen progress={loadingProgress} />}>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/home" element={<HomeAliasRedirect />} />
            <Route path="/home/*" element={<Navigate to={CANONICAL_HOME_PATH} replace />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </div>
      {showIntro && <LoadingScreen progress={loadingProgress} />}
    </AuthProvider>
  );
}
