'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  pending: 'badge-orange',
  accepted: 'badge-teal',
  rejected: 'badge-red',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/applications/my')
      .then((res) => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">My Activity</div>
          <h1>My Applications</h1>
        </div>
        <Link href="/projects" className="btn btn-teal">Browse Projects</Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              border: `1.5px solid ${filter === f ? 'var(--teal-500)' : 'var(--gray-200)'}`,
              background: filter === f ? 'rgba(0,201,167,0.1)' : 'var(--white)',
              color: filter === f ? 'var(--teal-500)' : 'var(--gray-600)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f} {f === 'all' ? `(${applications.length})` : `(${applications.filter(a => a.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((app: any) => (
            <div key={app._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'var(--navy-800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, flexShrink: 0,
                }}
              >
                🌍
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {app.projectId?.title || 'Unknown Project'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  <span className="badge badge-gray" style={{ marginRight: 8 }}>
                    {app.projectId?.category || 'N/A'}
                  </span>
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </div>
                {app.ngoFeedback && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                    💬 {app.ngoFeedback}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span className={`badge ${statusColors[app.status] || 'badge-gray'}`} style={{ fontSize: 13 }}>
                  {app.status}
                </span>
                {app.projectId?._id && (
                  <Link href={`/projects/${app.projectId._id}`} className="btn btn-outline btn-sm">
                    View Project
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
          <p>Browse projects and apply to start making an impact</p>
          <Link href="/projects" className="btn btn-teal">Browse Projects</Link>
        </div>
      )}
    </DashboardLayout>
  );
}
