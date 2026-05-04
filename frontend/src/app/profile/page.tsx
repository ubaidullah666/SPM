'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { getUser, setAuth } from '@/lib/auth';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const user = getUser();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    skills: '',
    organizationName: '',
    website: '',
    mission: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/me').then((res) => {
      const u = res.data;
      setForm({
        name: u.name || '',
        bio: u.bio || '',
        location: u.location || '',
        skills: (u.skills || []).join(', '),
        organizationName: u.organizationName || '',
        website: u.website || '',
        mission: u.mission || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const payload: any = {
        name: form.name,
        bio: form.bio,
        location: form.location,
      };
      if (user?.role === 'volunteer') {
        payload.skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (user?.role === 'ngo') {
        payload.organizationName = form.organizationName;
        payload.website = form.website;
        payload.mission = form.mission;
      }

      const res = await api.put('/users/me', payload);

      // Update stored user
      const currentToken = Cookies.get('token') || '';
      setAuth(currentToken, { ...user!, ...res.data });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-spinner"><div className="spinner" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">Account</div>
          <h1>My Profile</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card-dark" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--teal-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: 'var(--navy-900)',
              margin: '0 auto 16px',
            }}
          >
            {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--white)', marginBottom: 4 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16, textTransform: 'capitalize' }}>
            {user?.role}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(0,201,167,0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal-500)' }}>
                {user?.impactScore || 0}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Impact Score</div>
            </div>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--white)' }}>
                {user?.totalHours || 0}h
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Hours Volunteered</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Edit Profile</h2>

          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ Profile updated successfully!</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Tell us about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                placeholder="City, Country"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            {user?.role === 'volunteer' && (
              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input
                  className="form-input"
                  placeholder="Teaching, Web Development, Design..."
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'ngo' && (
              <>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input
                    className="form-input"
                    value={form.organizationName}
                    onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://yourorg.org"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mission Statement</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Your organization's mission..."
                    value={form.mission}
                    onChange={(e) => setForm({ ...form, mission: e.target.value })}
                    rows={3}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-teal" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
