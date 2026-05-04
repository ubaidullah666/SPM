'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      setAuth(res.data.access_token, res.data.user);
      if (res.data.user.role === 'ngo') {
        router.push('/dashboard/ngo');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">Impact<span>Hub</span></div>
        <h1 className="auth-tagline">
          Make a <span>difference</span> in the world
        </h1>
        <p className="auth-desc">
          Connect with NGOs, volunteer for meaningful projects, and track your social impact — all in one place.
        </p>
        <div style={{ marginTop: 48, display: 'flex', gap: 32 }}>
          {[
            { value: '500+', label: 'NGOs' },
            { value: '10K+', label: 'Volunteers' },
            { value: '2K+', label: 'Projects' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal-500)' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <h2 className="auth-form-title">Welcome back</h2>
        <p className="auth-form-sub">Sign in to your account to continue</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '24px 0' }}>or</div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-500)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--teal-500)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>

        <div style={{ marginTop: 32, padding: 16, background: 'var(--gray-100)', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8, fontWeight: 600 }}>
            DEMO ACCOUNTS
          </p>
          <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
            Volunteer: volunteer@demo.com / demo123<br />
            NGO: ngo@demo.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
