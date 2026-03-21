import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoadingScreen from './Components/LoadingScreen';
import { CANONICAL_HOME_PATH, getScrollIntent } from './utils/homeNavigation';

const Portfolio = lazy(() => import('./Pages/Portfolio/Portfolio'));
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

  return <LoadingScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/home" element={<HomeAliasRedirect />} />
          <Route path="/home/*" element={<Navigate to={CANONICAL_HOME_PATH} replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
