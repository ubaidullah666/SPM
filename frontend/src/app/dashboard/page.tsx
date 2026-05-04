'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getUser } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function VolunteerDashboard() {
  const user = getUser();
  const [stats, setStats] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appStats, contribs, apps] = await Promise.all([
          api.get('/applications/my/stats'),
          api.get('/contributions/my'),
          api.get('/applications/my'),
        ]);
        setStats(appStats.data);
        setContributions(contribs.data.slice(0, 5));
        setApplications(apps.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build chart data from contributions
  const chartData = contributions.slice(0, 6).map((c: any) => ({
    name: c.projectId?.title?.slice(0, 12) || 'Project',
    hours: c.hours,
    impact: c.impactScore,
  }));

  const statusColors: Record<string, string> = {
    pending: 'badge-orange',
    accepted: 'badge-teal',
    rejected: 'badge-red',
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
          <div className="page-label">Volunteer Dashboard</div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <Link href="/projects" className="btn btn-teal">
          + Find Projects
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card dark">
          <div className="stat-icon teal">🏆</div>
          <div className="stat-info">
            <div className="stat-value">{user?.impactScore || 0}</div>
            <div className="stat-label">Impact Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">⏱</div>
          <div className="stat-info">
            <div className="stat-value">{user?.totalHours || 0}</div>
            <div className="stat-label">Hours Volunteered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.total || 0}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.accepted || 0}</div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Contribution Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--teal-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Activity
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Contribution History</h3>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="var(--navy-800)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="impact" fill="var(--teal-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">📊</div>
              <p>No contributions yet. Apply to projects to get started!</p>
            </div>
          )}
        </div>

        {/* Impact Score Card */}
        <div className="card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--teal-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Impact Score
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>
              {user?.impactScore || 0}
            </div>
            <div style={{ fontSize: 14, color: 'var(--gray-400)', marginTop: 8 }}>
              Total impact points earned
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Progress to next level</span>
              <span style={{ fontSize: 12, color: 'var(--teal-500)', fontWeight: 600 }}>
                {Math.min(100, Math.round(((user?.impactScore || 0) % 500) / 5))}%
              </span>
            </div>
            <div className="impact-bar">
              <div
                className="impact-bar-fill"
                style={{ width: `${Math.min(100, Math.round(((user?.impactScore || 0) % 500) / 5))}%` }}
              />
            </div>
          </div>
          <Link href="/dashboard/portfolio" className="btn btn-teal" style={{ marginTop: 20 }}>
            View Portfolio →
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Recent Applications</h3>
          <Link href="/dashboard/applications" style={{ fontSize: 13, color: 'var(--teal-500)', fontWeight: 600 }}>
            View all →
          </Link>
        </div>
        {applications.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app: any) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600 }}>
                      {app.projectId?.title || 'Unknown Project'}
                    </td>
                    <td>
                      <span className="badge badge-gray">{app.projectId?.category || '-'}</span>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[app.status] || 'badge-gray'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Browse projects and apply to start making an impact</p>
            <Link href="/projects" className="btn btn-teal">Browse Projects</Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
