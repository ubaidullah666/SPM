import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributionEntity } from '../entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ProjectsService } from '../projects/projects.service';
import { stringId } from '../common/serialize';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly contributionRepo: Repository<ContributionEntity>,
    private readonly projectsService: ProjectsService,
  ) {}

  private calculateImpactScore(hours: number): number {
    return Math.round(hours * 10);
  }

  async create(
    createContributionDto: CreateContributionDto,
    userId: number,
  ): Promise<Record<string, unknown>> {
    const impactScore = this.calculateImpactScore(createContributionDto.hours);

    const contribution = this.contributionRepo.create({
      userId,
      projectId: Number.parseInt(createContributionDto.projectId, 10),
      hours: createContributionDto.hours,
      impactScore,
      taskDescription: createContributionDto.description ?? null,
      tasksCompleted: createContributionDto.tasksCompleted ?? null,
      contributionDate: new Date(),
      verifiedByNgo: false,
    });

    const saved = await this.contributionRepo.save(contribution);
    const full = await this.contributionRepo.findOne({
      where: { id: saved.id },
      relations: ['project', 'project.ngo'],
    });
    return this.serializeContribution(full!);
  }

  private serializeContribution(c: ContributionEntity): Record<string, unknown> {
    const id = stringId(c.id);
    const project = c.project;
    return {
      _id: id,
      id,
      userId: stringId(c.userId),
      projectId: project
        ? {
            _id: stringId(project.id),
            id: stringId(project.id),
            title: project.title,
            category: project.category ?? '',
            ngoName: project.ngo?.name ?? '',
          }
        : { _id: stringId(c.projectId), id: stringId(c.projectId) },
      hours: c.hours,
      impactScore: c.impactScore,
      description: c.taskDescription ?? '',
      tasksCompleted: c.tasksCompleted ?? [],
      isVerified: c.verifiedByNgo,
      createdAt: c.createdAt,
      contributionDate: c.contributionDate,
    };
  }

  async findByUser(userId: number): Promise<Record<string, unknown>[]> {
    const rows = await this.contributionRepo.find({
      where: { userId },
      relations: ['project', 'project.ngo'],
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.serializeContribution(r));
  }

  async findByProject(projectId: string): Promise<Record<string, unknown>[]> {
    const pid = Number.parseInt(projectId, 10);
    const rows = await this.contributionRepo.find({
      where: { projectId: pid },
      relations: ['user', 'project', 'project.ngo'],
      order: { createdAt: 'DESC' },
    });

    return rows.map((r) => {
      const base = this.serializeContribution(r);
      const u = r.user;
      return {
        ...base,
        userId: u
          ? {
              _id: stringId(u.id),
              id: stringId(u.id),
              name: u.fullName,
              email: u.email,
              avatar: u.profileImage ?? '',
            }
          : base.userId,
      };
    });
  }

  async verify(id: string, verifierNgoId: number): Promise<Record<string, unknown>> {
    const contribution = await this.contributionRepo.findOne({
      where: { id: Number.parseInt(id, 10) },
      relations: ['project'],
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    const project = await this.projectsService.findEntityById(
      contribution.projectId,
    );
    if (project.ngoId !== verifierNgoId) {
      throw new ForbiddenException('Access denied');
    }

    contribution.verifiedByNgo = true;
    await this.contributionRepo.save(contribution);

    const reloaded = await this.contributionRepo.findOne({
      where: { id: contribution.id },
      relations: ['project', 'project.ngo'],
    });
    return this.serializeContribution(reloaded!);
  }

  async getUserImpactSummary(userId: number): Promise<Record<string, unknown>> {
    const contributions = await this.contributionRepo.find({
      where: { userId },
    });

    let totalHours = 0;
    let totalImpact = 0;
    for (const c of contributions) {
      totalHours += Number(c.hours);
      totalImpact += c.impactScore;
    }
    const projects = new Set(contributions.map((c) => c.projectId));

    return {
      totalHours,
      totalImpact,
      projectCount: projects.size,
      contributionCount: contributions.length,
    };
  }
}
