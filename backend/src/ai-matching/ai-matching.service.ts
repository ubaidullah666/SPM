import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class AiMatchingService {
  constructor(private projectsService: ProjectsService) {}

  async getSuggestedProjects(userSkills: string[]): Promise<Record<string, unknown>[]> {
    if (!userSkills || userSkills.length === 0) {
      return this.projectsService.findAll({ status: 'open' });
    }

    const allProjects = await this.projectsService.findAll({ status: 'open' });

    const scored = allProjects.map((proj) => {
      const skills = Array.isArray(proj.requiredSkills)
        ? (proj.requiredSkills as string[])
        : [];

      const overlap = skills.filter((skill: string) =>
        userSkills.some((us: string) => us.toLowerCase() === skill.toLowerCase()),
      ).length;

      const score =
        skills.length > 0 ? overlap / skills.length : 0;

      return {
        ...proj,
        matchScore: Math.round(score * 100),
      };
    });

    return scored
      .sort((a, b) => (b.matchScore as number) - (a.matchScore as number))
      .slice(0, 10);
  }

  async sendToAiService(projectData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return {
      status: 'queued',
      message: 'Project data sent to AI matching module (placeholder)',
      projectId: projectData._id ?? projectData.id,
    };
  }
}
