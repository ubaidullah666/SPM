'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';

export default function NgoProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = () => {
    api.get('/projects/my-projects')
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setDeleting(id);
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">NGO Management</div>
          <h1>My Projects</h1>
        </div>
        <Link href="/dashboard/ngo/projects/new" className="btn btn-teal">
          + Post New Project
        </Link>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : projects.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.map((p: any) => (
            <div key={p._id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
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
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.title}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">{p.category}</span>
                  <span className={`badge ${p.status === 'open' ? 'badge-teal' : p.status === 'ongoing' ? 'badge-blue' : 'badge-gray'}`}>
                    {p.status}
                  </span>
                  {p.isRemote && <span className="badge badge-blue">Remote</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{p.totalApplications || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Applications</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{p.volunteersAccepted || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Accepted</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/dashboard/ngo/applications?project=${p._id}`} className="btn btn-outline btn-sm">
                  Applications
                </Link>
                <Link href={`/dashboard/ngo/projects/${p._id}/edit`} className="btn btn-outline btn-sm">
                  Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p._id)}
                  disabled={deleting === p._id}
                >
                  {deleting === p._id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Post your first project to start finding volunteers</p>
          <Link href="/dashboard/ngo/projects/new" className="btn btn-teal">Post Project</Link>
        </div>
      )}
    </DashboardLayout>
  );
}
