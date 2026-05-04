'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';

const COLORS = ['#00c9a7', '#1a2d42', '#3b82f6', '#f59e0b', '#ef4444'];

export default function PortfolioPage() {
  const user = getUser();
  const [contributions, setContributions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contribs, sum, ratingData] = await Promise.all([
          api.get('/contributions/my'),
          api.get('/contributions/my/summary'),
          api.get(`/ratings/user/${user?.id}`),
        ]);
        setContributions(contribs.data);
        setSummary(sum.data);
        setRatings(ratingData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  // Build category breakdown for pie chart
  const categoryMap: Record<string, number> = {};
  contributions.forEach((c: any) => {
    const cat = c.projectId?.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + c.hours;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Skills radar data
  const skillsData = (user?.skills || []).slice(0, 6).map((skill: string) => ({
    skill,
    level: Math.floor(Math.random() * 40) + 60, // placeholder
  }));

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
          <div className="page-label">Impact Portfolio</div>
          <h1>My Impact Story</h1>
        </div>
      </div>

      {/* Hero Impact Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-700) 100%)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          color: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--teal-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'var(--navy-900)',
            flexShrink: 0,
          }}
        >
          {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 12 }}>
            Volunteer · {user?.skills?.join(', ') || 'No skills listed'}
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { value: user?.impactScore || 0, label: 'Impact Score' },
              { value: `${user?.totalHours || 0}h`, label: 'Hours Volunteered' },
              { value: summary?.projectCount || 0, label: 'Projects' },
              { value: ratings?.average || 0, label: 'Avg Rating' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--teal-500)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Hours by Category */}
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Hours by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p>Log contributions to see breakdown</p>
            </div>
          )}
        </div>

        {/* Skills Radar */}
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Skills Profile</h3>
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <Radar dataKey="level" stroke="var(--teal-500)" fill="var(--teal-500)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p>Add skills to your profile to see radar chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Contribution Timeline */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Contribution Timeline</h3>
        {contributions.length > 0 ? (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--gray-200)' }} />
            {contributions.map((c: any, i) => (
              <div key={c._id} style={{ position: 'relative', marginBottom: 20, paddingLeft: 20 }}>
                <div
                  style={{
                    position: 'absolute', left: -20, top: 4,
                    width: 12, height: 12, borderRadius: '50%',
                    background: c.isVerified ? 'var(--teal-500)' : 'var(--gray-300)',
                    border: '2px solid var(--white)',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {c.projectId?.title || 'Unknown Project'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                      {c.description || 'Volunteer work'}
                    </div>
                    {c.tasksCompleted?.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.tasksCompleted.map((t: string) => (
                          <span key={t} className="skill-tag" style={{ fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ fontWeight: 700, color: 'var(--teal-500)' }}>{c.hours}h</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                    <span className={`badge ${c.isVerified ? 'badge-teal' : 'badge-gray'}`} style={{ marginTop: 4 }}>
                      {c.isVerified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No contributions yet. Start volunteering to build your portfolio!</p>
          </div>
        )}
      </div>

      {/* Ratings */}
      {ratings && ratings.count > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            Reviews from NGOs · ⭐ {ratings.average}
          </h3>
          {ratings.ratings.map((r: any) => (
            <div key={r._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{r.raterId?.organizationName || r.raterId?.name}</div>
                <span style={{ color: 'var(--warning)' }}>{'⭐'.repeat(r.score)}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
