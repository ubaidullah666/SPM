'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = [
  'Education', 'Environment', 'Health', 'Technology',
  'Community', 'Arts', 'Sports', 'Animals', 'Disaster Relief', 'Other',
];

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    requiredSkills: '',
    location: '',
    isRemote: false,
    volunteersNeeded: '',
    estimatedHours: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/projects', {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        volunteersNeeded: form.volunteersNeeded ? parseInt(form.volunteersNeeded) : 0,
        estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      router.push('/dashboard/ngo/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">NGO Management</div>
          <h1>Post New Project</h1>
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
                placeholder="e.g. Digital Literacy Program for Rural Schools"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe the project, its goals, and what volunteers will do..."
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
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Volunteers Needed</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={form.volunteersNeeded}
                  onChange={(e) => setForm({ ...form, volunteersNeeded: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (comma-separated)</label>
              <input
                className="form-input"
                placeholder="e.g. Teaching, Web Development, Design"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Hours</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="Total hours needed"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
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
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
                  This is a remote project
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href="/dashboard/ngo/projects" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-teal" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
