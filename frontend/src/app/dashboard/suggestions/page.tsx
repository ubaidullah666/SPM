'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import Link from 'next/link';

export default function SuggestionsPage() {
  const user = getUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ai-matching/suggestions')
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">AI Matching</div>
          <h1>Suggested Projects ✨</h1>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--navy-800), var(--navy-700))', color: 'var(--white)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 40 }}>🤖</div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>AI-Powered Matching</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
              Projects matched to your skills: {user?.skills?.join(', ') || 'No skills listed yet'}
            </p>
            {(!user?.skills || user.skills.length === 0) && (
              <Link href="/profile" style={{ color: 'var(--teal-500)', fontSize: 13, fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
                Add skills to your profile →
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <h3>No suggestions yet</h3>
          <p>Add skills to your profile to get personalized project recommendations</p>
          <Link href="/profile" className="btn btn-teal">Update Profile</Link>
        </div>
      )}
    </DashboardLayout>
  );
}
