'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'volunteer',
    organizationName: '',
    skills: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        bio: form.bio,
      };
      if (form.role === 'volunteer') {
        payload.skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (form.role === 'ngo') {
        payload.organizationName = form.organizationName;
      }

      const res = await api.post('/auth/register', payload);
      setAuth(res.data.access_token, res.data.user);
      if (res.data.user.role === 'ngo') {
        router.push('/dashboard/ngo');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      // NestJS validation errors return message as string or string[]
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">Impact<span>Hub</span></div>
        <h1 className="auth-tagline">
          Join thousands of <span>changemakers</span>
        </h1>
        <p className="auth-desc">
          Whether you&apos;re a volunteer looking to contribute or an NGO seeking help, ImpactHub connects you with the right people.
        </p>
        <div style={{ marginTop: 48 }}>
          {[
            { icon: '🌍', text: 'Work on global social impact projects' },
            { icon: '📊', text: 'Track your contributions and impact score' },
            { icon: '🤝', text: 'Connect with verified NGOs worldwide' },
            { icon: '🏆', text: 'Build your volunteer portfolio' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: 'var(--gray-300)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <h2 className="auth-form-title">Create account</h2>
        <p className="auth-form-sub">Start your impact journey today</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {['volunteer', 'ngo'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: `2px solid ${form.role === r ? 'var(--teal-500)' : 'var(--gray-200)'}`,
                  background: form.role === r ? 'rgba(0,201,167,0.08)' : 'transparent',
                  color: form.role === r ? 'var(--teal-500)' : 'var(--gray-500)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {r === 'volunteer' ? '👤 Volunteer' : '🏢 NGO'}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {form.role === 'ngo' && (
            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                className="form-input"
                placeholder="Green Earth Foundation"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              />
            </div>
          )}

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
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {form.role === 'volunteer' && (
            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input
                className="form-input"
                placeholder="Teaching, Web Development, Design..."
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Bio (optional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-500)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--teal-500)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
