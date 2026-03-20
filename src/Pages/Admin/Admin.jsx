import { Suspense, lazy, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminAuth from './AdminAuth';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

export default function Admin() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = 'Blog Admin - Dee';
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f9fa', color: '#111827' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminAuth />;
  }

  return (
    <Suspense
      fallback={(
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f9fa', color: '#111827' }}>
          <p>Loading dashboard...</p>
        </div>
      )}
    >
      <AdminDashboard user={user} />
    </Suspense>
  );
}
