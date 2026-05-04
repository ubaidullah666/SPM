'use client';
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';

const CATEGORIES = [
  'All', 'Education', 'Environment', 'Health', 'Technology',
  'Community', 'Arts', 'Sports', 'Animals', 'Disaster Relief',
];

const SKILLS = [
  'Teaching', 'Web Development', 'Design', 'Marketing', 'Writing',
  'Data Analysis', 'Medical', 'Legal', 'Finance', 'Photography',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [skill, setSkill] = useState('');
  const [remote, setRemote] = useState('');
  const [status, setStatus] = useState('open');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (skill) params.skills = skill;
      if (remote) params.isRemote = remote;
      if (status) params.status = status;

      const res = await api.get('/projects', { params });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, skill, remote, status]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-label">Discover</div>
          <h1>Browse Projects</h1>
        </div>
        <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <span style={{ color: 'var(--gray-400)', fontSize: 18 }}>🔍</span>
          <input
            placeholder="Search projects by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select
            className="form-input form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="form-input form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="form-input form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-input form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="true">Remote Only</option>
            <option value="false">On-site Only</option>
          </select>

          {(search || category !== 'All' || skill || remote || status !== 'open') && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setCategory('All');
                setSkill('');
                setRemote('');
                setStatus('open');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: `1.5px solid ${category === c ? 'var(--teal-500)' : 'var(--gray-200)'}`,
              background: category === c ? 'rgba(0,201,167,0.1)' : 'var(--white)',
              color: category === c ? 'var(--teal-500)' : 'var(--gray-600)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
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
          <div className="empty-icon">🔍</div>
          <h3>No projects found</h3>
          <p>Try adjusting your search filters</p>
          <button
            className="btn btn-teal"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setSkill('');
              setRemote('');
              setStatus('');
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
