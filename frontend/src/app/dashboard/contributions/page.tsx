'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ projectId: '', hours: '', description: '', tasksCompleted: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [myProjects, setMyProjects] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [contribs, sum] = await Promise.all([
        api.get('/contributions/my'),
        api.get('/contributions/my/summary'),
      ]);
      setContributions(contribs.data);
      setSummary(sum.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Fetch accepted applications to get project list
    api.get('/applications/my').then((res) => {
      const accepted = res.data.filter((a: any) => a.status === 'accepted');
      setMyProjects(accepted);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contributions', {
        projectId: form.projectId,
        hours: parseFloat(form.hours),
        description: form.description,
        tasksCompleted: form.tasksCompleted.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setShowModal(false);
      setForm({ projectId: '', hours: '', description: '', tasksCompleted: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log contribution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">Track Impact</div>
          <h1>My Contributions</h1>
        </div>
        <button className="btn btn-teal" onClick={() => setShowModal(true)}>
          + Log Hours
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card dark">
            <div className="stat-icon teal">⏱</div>
            <div className="stat-info">
              <div className="stat-value">{summary.totalHours}</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon teal">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{summary.totalImpact}</div>
              <div className="stat-label">Impact Points</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📁</div>
            <div className="stat-info">
              <div className="stat-value">{summary.projectCount}</div>
              <div className="stat-label">Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">📝</div>
            <div className="stat-info">
              <div className="stat-value">{summary.contributionCount}</div>
              <div className="stat-label">Log Entries</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : contributions.length > 0 ? (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Impact Score</th>
                  <th>Description</th>
                  <th>Verified</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c: any) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>
                      {c.projectId?.title || 'Unknown'}
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                        {c.projectId?.ngoName}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--teal-500)' }}>{c.hours}h</span>
                    </td>
                    <td>
                      <span className="badge badge-teal">+{c.impactScore}</span>
                    </td>
                    <td style={{ maxWidth: 200, color: 'var(--gray-600)', fontSize: 13 }}>
                      {c.description || '-'}
                    </td>
                    <td>
                      {c.isVerified ? (
                        <span className="badge badge-green">✓ Verified</span>
                      ) : (
                        <span className="badge badge-gray">Pending</span>
                      )}
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">⏱</div>
          <h3>No contributions logged yet</h3>
          <p>Log your volunteer hours to track your impact</p>
          <button className="btn btn-teal" onClick={() => setShowModal(true)}>
            Log First Hours
          </button>
        </div>
      )}

      {/* Log Hours Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Log Volunteer Hours</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select
                  className="form-input form-select"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  required
                >
                  <option value="">Select a project...</option>
                  {myProjects.map((app: any) => (
                    <option key={app.projectId?._id} value={app.projectId?._id}>
                      {app.projectId?.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hours Worked</label>
                <input
                  className="form-input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="e.g. 3.5"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="What did you work on?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tasks Completed (comma-separated)</label>
                <input
                  className="form-input"
                  placeholder="Taught 20 students, Created lesson plan..."
                  value={form.tasksCompleted}
                  onChange={(e) => setForm({ ...form, tasksCompleted: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Saving...' : 'Log Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
