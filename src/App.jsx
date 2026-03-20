import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const Portfolio = lazy(() => import('./Pages/Portfolio/Portfolio'));
const Blog = lazy(() => import('./Pages/Blog/Blog'));
const Admin = lazy(() => import('./Pages/Admin/Admin'));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/home" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
