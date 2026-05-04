import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class AiMatchingService {
  constructor(private projectsService: ProjectsService) {}

  /**
   * Basic skill-based project matching.
   * Placeholder for a real AI matching module.
   */
  async getSuggestedProjects(userSkills: string[]): Promise<any[]> {
    if (!userSkills || userSkills.length === 0) {
      // Return recent open projects if no skills
      return this.projectsService.findAll({ status: 'open' });
    }

    // Score projects by skill overlap
    const allProjects = await this.projectsService.findAll({ status: 'open' });

    const scored = allProjects.map((project) => {
      const overlap = project.requiredSkills.filter((skill) =>
        userSkills.some(
          (us) => us.toLowerCase() === skill.toLowerCase(),
        ),
      ).length;

      const score =
        project.requiredSkills.length > 0
          ? overlap / project.requiredSkills.length
          : 0;

      return { project, matchScore: Math.round(score * 100) };
    });

    // Sort by match score descending, return top 10
    return scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
      .map(({ project, matchScore }) => ({ ...project.toObject(), matchScore }));
  }

  /**
   * Placeholder endpoint for external AI service integration.
   */
  async sendToAiService(projectData: any): Promise<any> {
    // TODO: Integrate with real AI matching service
    return {
      status: 'queued',
      message: 'Project data sent to AI matching module (placeholder)',
      projectId: projectData._id,
    };
  }
}
