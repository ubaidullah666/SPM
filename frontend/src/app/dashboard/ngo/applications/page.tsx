'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function NgoApplicationsPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>}>
      <NgoApplicationsContent />
    </Suspense>
  );
}

function NgoApplicationsContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState(projectIdParam || '');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<any>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api.get('/projects/my-projects').then((res) => {
      setProjects(res.data);
      if (!selectedProject && res.data.length > 0) {
        setSelectedProject(res.data[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api.get(`/applications/project/${selectedProject}`)
      .then((res) => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const handleReview = async (appId: string, status: 'accepted' | 'rejected', ngoFeedback?: string) => {
    setReviewing(appId);
    try {
      await api.put(`/applications/${appId}/review`, { status, ngoFeedback: ngoFeedback || '' });
      setApplications((prev) =>
        prev.map((a) => a._id === appId ? { ...a, status, ngoFeedback } : a)
      );
      setFeedbackModal(null);
      setFeedback('');
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'badge-orange',
    accepted: 'badge-teal',
    rejected: 'badge-red',
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">NGO Management</div>
          <h1>Review Applications</h1>
        </div>
      </div>

      {/* Project Selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Select Project</label>
          <select
            className="form-input form-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Choose a project...</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} ({p.totalApplications || 0} applications)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : applications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app: any) => (
            <div key={app._id} className="card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--teal-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'var(--navy-900)',
                    flexShrink: 0,
                  }}
                >
                  {app.userId?.name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{app.userId?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>
                    {app.userId?.email}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span className="badge badge-gray">
                      ⏱ {app.userId?.totalHours || 0}h volunteered
                    </span>
                    <span className="badge badge-teal">
                      🏆 {app.userId?.impactScore || 0} impact
                    </span>
                  </div>
                  {app.userId?.skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {app.userId.skills.map((s: string) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}
                  {app.coverLetter && (
                    <div style={{ padding: '10px 14px', background: 'var(--gray-100)', borderRadius: 8, fontSize: 13, color: 'var(--gray-600)', marginTop: 8 }}>
                      <strong>Cover Letter:</strong> {app.coverLetter}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${statusColors[app.status] || 'badge-gray'}`}>
                    {app.status}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-teal btn-sm"
                        onClick={() => handleReview(app._id, 'accepted')}
                        disabled={reviewing === app._id}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setFeedbackModal(app)}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedProject ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications yet</h3>
          <p>Applications will appear here when volunteers apply</p>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>Select a project</h3>
          <p>Choose a project above to view its applications</p>
        </div>
      )}

      {/* Reject with Feedback Modal */}
      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Application</h2>
              <button className="modal-close" onClick={() => setFeedbackModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 16 }}>
              Rejecting application from <strong>{feedbackModal.userId?.name}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Feedback (optional)</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Provide feedback to help the volunteer improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setFeedbackModal(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleReview(feedbackModal._id, 'rejected', feedback)}
                disabled={reviewing === feedbackModal._id}
                style={{ flex: 1 }}
              >
                {reviewing === feedbackModal._id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
