'use client';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  ngoName: string;
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  status: string;
  volunteersNeeded: number;
  volunteersAccepted: number;
  estimatedHours: number;
  totalApplications: number;
  matchScore?: number;
}

const categoryEmojis: Record<string, string> = {
  education: '📚',
  environment: '🌿',
  health: '❤️',
  technology: '💻',
  community: '🤝',
  arts: '🎨',
  sports: '⚽',
  animals: '🐾',
  disaster: '🆘',
  default: '🌍',
};

const statusColors: Record<string, string> = {
  open: 'badge-teal',
  ongoing: 'badge-blue',
  completed: 'badge-green',
  closed: 'badge-gray',
};

export default function ProjectCard({ project }: { project: Project }) {
  const emoji =
    categoryEmojis[project.category?.toLowerCase()] || categoryEmojis.default;
  const spotsLeft = project.volunteersNeeded - project.volunteersAccepted;

  return (
    <div className="project-card">
      <div className="project-card-image">
        <span style={{ fontSize: 56 }}>{emoji}</span>
        {project.matchScore !== undefined && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'var(--teal-500)',
              color: 'var(--navy-900)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {project.matchScore}% match
          </div>
        )}
      </div>

      <div className="project-card-body">
        <div className="project-card-category">{project.category}</div>
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>

        <div className="project-card-meta">
          <span className={`badge ${statusColors[project.status] || 'badge-gray'}`}>
            {project.status}
          </span>
          {project.isRemote && <span className="badge badge-blue">Remote</span>}
          {project.estimatedHours > 0 && (
            <span className="badge badge-gray">⏱ {project.estimatedHours}h</span>
          )}
          {spotsLeft > 0 && (
            <span className="badge badge-orange">{spotsLeft} spots left</span>
          )}
        </div>

        {project.requiredSkills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {project.requiredSkills.slice(0, 3).map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
            {project.requiredSkills.length > 3 && (
              <span className="skill-tag">+{project.requiredSkills.length - 3}</span>
            )}
          </div>
        )}

        <div className="project-card-footer">
          <div>
            <div className="project-ngo">🏢 {project.ngoName}</div>
            {project.location && (
              <div className="project-ngo" style={{ marginTop: 2 }}>
                📍 {project.location}
              </div>
            )}
          </div>
          <Link href={`/projects/${project._id}`} className="btn btn-teal btn-sm">
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
