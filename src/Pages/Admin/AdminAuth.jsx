import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminAuth() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await signIn(email, password);
      setMessage('Sign in successful!');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans grid place-items-center p-6 md:p-10">
      <main className="w-full grid place-items-center">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 md:p-10">
          <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
          <p className="text-sm text-zinc-500 mt-1 mb-7">Access your admin dashboard and content controls.</p>

          {error ? <div className="mb-4 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">{error}</div> : null}
          {message ? <div className="mb-4 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">{message}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                id="auth-email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-200 bg-zinc-50 rounded-lg text-sm"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                id="auth-password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-200 bg-zinc-50 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-black text-white hover:bg-zinc-800 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
