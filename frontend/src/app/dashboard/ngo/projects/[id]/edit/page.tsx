'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = [
  'Education', 'Environment', 'Health', 'Technology',
  'Community', 'Arts', 'Sports', 'Animals', 'Disaster Relief', 'Other',
];

const STATUSES = ['open', 'ongoing', 'completed', 'closed'];

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => {
      const p = res.data;
      setForm({
        title: p.title || '',
        description: p.description || '',
        category: p.category || '',
        requiredSkills: (p.requiredSkills || []).join(', '),
        location: p.location || '',
        isRemote: p.isRemote || false,
        volunteersNeeded: p.volunteersNeeded || '',
        estimatedHours: p.estimatedHours || '',
        startDate: p.startDate ? p.startDate.split('T')[0] : '',
        endDate: p.endDate ? p.endDate.split('T')[0] : '',
        status: p.status || 'open',
      });
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/projects/${id}`, {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
        volunteersNeeded: form.volunteersNeeded ? parseInt(form.volunteersNeeded) : 0,
        estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : 0,
      });
      router.push('/dashboard/ngo/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
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
          <div className="page-label">NGO Management</div>
          <h1>Edit Project</h1>
        </div>
        <Link href="/dashboard/ngo/projects" className="btn btn-outline">← Back</Link>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="card">
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (comma-separated)</label>
              <input
                className="form-input"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Volunteers Needed</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.volunteersNeeded}
                  onChange={(e) => setForm({ ...form, volunteersNeeded: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.isRemote}
                  onChange={(e) => setForm({ ...form, isRemote: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--teal-500)' }}
                />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Remote project</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/dashboard/ngo/projects" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-teal" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
