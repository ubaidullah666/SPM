'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();
  const [project, setProject] = useState<any>(null);
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proj, ratingData] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/ratings/project/${id}`),
        ]);
        setProject(proj.data);
        setRatings(ratingData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    try {
      await api.post('/applications', { projectId: id, coverLetter });
      setApplySuccess(true);
      setShowApplyModal(false);
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-spinner"><div className="spinner" /></div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h3>Project not found</h3>
          <Link href="/projects" className="btn btn-teal">Back to Projects</Link>
        </div>
      </DashboardLayout>
    );
  }

  const spotsLeft = project.volunteersNeeded - project.volunteersAccepted;

  return (
    <DashboardLayout>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: 20 }}
      >
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 80, height: 80, borderRadius: 16,
                  background: 'var(--navy-800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, flexShrink: 0,
                }}
              >
                🌍
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="badge badge-teal">{project.category}</span>
                  <span className={`badge ${project.status === 'open' ? 'badge-teal' : project.status === 'ongoing' ? 'badge-blue' : 'badge-gray'}`}>
                    {project.status}
                  </span>
                  {project.isRemote && <span className="badge badge-blue">Remote</span>}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 8 }}>
                  {project.title}
                </h1>
                <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                  🏢 {project.ngoName}
                  {project.location && ` · 📍 ${project.location}`}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>About this Project</h2>
            <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.8 }}>
              {project.description}
            </p>
          </div>

          {project.requiredSkills?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Required Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.requiredSkills.map((skill: string) => (
                  <span key={skill} className="skill-tag" style={{ fontSize: 14, padding: '6px 14px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ratings */}
          {ratings && ratings.count > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                Reviews ({ratings.count}) · ⭐ {ratings.average}
              </h2>
              {ratings.ratings.slice(0, 3).map((r: any) => (
                <div key={r._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.raterId?.name || 'Anonymous'}</span>
                    <span style={{ color: 'var(--warning)' }}>{'⭐'.repeat(r.score)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Volunteers Needed', value: project.volunteersNeeded || '∞' },
                { label: 'Spots Left', value: spotsLeft > 0 ? spotsLeft : 'Full' },
                { label: 'Est. Hours', value: project.estimatedHours || 'Flexible' },
                { label: 'Applications', value: project.totalApplications || 0 },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center', padding: 12, background: 'var(--gray-100)', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy-900)' }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {project.startDate && (
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--gray-600)' }}>
                📅 Start: {new Date(project.startDate).toLocaleDateString()}
              </div>
            )}
            {project.endDate && (
              <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--gray-600)' }}>
                🏁 End: {new Date(project.endDate).toLocaleDateString()}
              </div>
            )}

            {applySuccess ? (
              <div className="alert alert-success">✅ Application submitted successfully!</div>
            ) : user?.role === 'volunteer' && project.status === 'open' ? (
              <button
                className="btn btn-teal w-full btn-lg"
                onClick={() => setShowApplyModal(true)}
              >
                Apply Now
              </button>
            ) : user?.role === 'ngo' ? (
              <Link href={`/dashboard/ngo/applications?project=${project._id}`} className="btn btn-primary w-full">
                View Applications
              </Link>
            ) : null}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>About the NGO</h3>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{project.ngoName}</div>
            {project.location && (
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>📍 {project.location}</div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Apply to {project.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>

            {applyError && <div className="alert alert-error">⚠️ {applyError}</div>}

            <div className="form-group">
              <label className="form-label">Cover Letter (optional)</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Tell the NGO why you're a great fit for this project..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowApplyModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-teal"
                onClick={handleApply}
                disabled={applying}
                style={{ flex: 1 }}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
