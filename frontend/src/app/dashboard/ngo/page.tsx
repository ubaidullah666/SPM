'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getUser } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function NgoDashboard() {
  const user = getUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projs, stats] = await Promise.all([
          api.get('/projects/my-projects'),
          api.get('/projects/stats'),
        ]);
        setProjects(projs.data);
        setProjectStats(stats.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = projects.slice(0, 6).map((p: any) => ({
    name: p.title?.slice(0, 14) || 'Project',
    applications: p.totalApplications || 0,
    accepted: p.volunteersAccepted || 0,
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-spinner"><div className="spinner" /></div>
      </DashboardLayout>
    );
  }

  const totalApplications = projects.reduce((s, p) => s + (p.totalApplications || 0), 0);
  const totalVolunteers = projects.reduce((s, p) => s + (p.volunteersAccepted || 0), 0);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">NGO Dashboard</div>
          <h1>{user?.organizationName || user?.name} 🏢</h1>
        </div>
        <Link href="/dashboard/ngo/projects/new" className="btn btn-teal">
          + Post Project
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card dark">
          <div className="stat-icon teal">📁</div>
          <div className="stat-info">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <div className="stat-value">{totalApplications}</div>
            <div className="stat-label">Applications Received</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{totalVolunteers}</div>
            <div className="stat-label">Volunteers Accepted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🔓</div>
          <div className="stat-info">
            <div className="stat-value">{projectStats?.open || 0}</div>
            <div className="stat-label">Open Projects</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Chart */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--teal-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Analytics
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Project Performance</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Applications vs accepted volunteers</p>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="var(--navy-800)" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="accepted" fill="var(--teal-500)" radius={[4, 4, 0, 0]} name="Accepted" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">📊</div>
              <p>Post projects to see analytics</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card-dark">
          <div style={{ fontSize: 11, color: 'var(--teal-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/dashboard/ngo/projects/new" className="btn btn-teal">
              📝 Post New Project
            </Link>
            <Link href="/dashboard/ngo/applications" className="btn btn-outline" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.2)' }}>
              📋 Review Applications
            </Link>
            <Link href="/dashboard/ngo/projects" className="btn btn-outline" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.2)' }}>
              📁 Manage Projects
            </Link>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,201,167,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--teal-500)', fontWeight: 600, marginBottom: 4 }}>
              IMPACT SUMMARY
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)' }}>
              {totalVolunteers}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
              Volunteers engaged across all projects
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Recent Projects</h3>
          <Link href="/dashboard/ngo/projects" style={{ fontSize: 13, color: 'var(--teal-500)', fontWeight: 600 }}>
            View all →
          </Link>
        </div>
        {projects.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Accepted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p: any) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td>
                      <span className={`badge ${p.status === 'open' ? 'badge-teal' : p.status === 'ongoing' ? 'badge-blue' : 'badge-gray'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.totalApplications || 0}</td>
                    <td>{p.volunteersAccepted || 0}</td>
                    <td>
                      <Link href={`/dashboard/ngo/applications?project=${p._id}`} className="btn btn-sm btn-outline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Post your first project to start finding volunteers</p>
            <Link href="/dashboard/ngo/projects/new" className="btn btn-teal">Post Project</Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
