import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { UserEntity } from '../entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { ProjectsService } from '../projects/projects.service';
import { ApplicationStatus } from '../common/enums/status.enum';
import { serializeProjectBrief } from '../common/serialize';
import { UsersService } from '../users/users.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepo: Repository<ApplicationEntity>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  private async serializeVolunteerBrief(
    user: UserEntity,
  ): Promise<Record<string, unknown>> {
    const totals = await this.usersService.getImpactTotals(user.id);
    const uid = String(user.id);
    return {
      _id: uid,
      id: uid,
      name: user.fullName,
      email: user.email,
      skills: user.skills ?? [],
      impactScore: totals.impactScore,
      totalHours: totals.totalHours,
      avatar: user.profileImage ?? '',
    };
  }

  async apply(
    createApplicationDto: CreateApplicationDto,
    userId: number,
  ): Promise<Record<string, unknown>> {
    await this.projectsService.findById(createApplicationDto.projectId);

    const projectPk = Number.parseInt(createApplicationDto.projectId, 10);

    const existing = await this.applicationRepo.findOne({
      where: { userId, projectId: projectPk },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this project');
    }

    const application = this.applicationRepo.create({
      userId,
      projectId: projectPk,
      coverLetter: createApplicationDto.coverLetter ?? '',
      status: 'pending',
    });

    const saved = await this.applicationRepo.save(application);
    await this.projectsService.incrementApplicationCount(projectPk);

    const full = await this.loadApplication(saved.id);
    return this.serializeVolunteerApplication(full);
  }

  private async loadApplication(id: number): Promise<ApplicationEntity> {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: ['project', 'project.ngo', 'user'],
    });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    return app;
  }

  private serializeVolunteerApplication(
    a: ApplicationEntity,
  ): Record<string, unknown> {
    const id = String(a.id);
    return {
      _id: id,
      id,
      userId: String(a.userId),
      projectId: serializeProjectBrief(a.project),
      status: a.status,
      coverLetter: a.coverLetter ?? '',
      ngoFeedback: a.reviewNote ?? '',
      reviewedAt: a.reviewedAt,
      createdAt: a.appliedAt,
    };
  }

  async findMyApplications(userId: number): Promise<Record<string, unknown>[]> {
    const rows = await this.applicationRepo.find({
      where: { userId },
      relations: ['project', 'project.ngo'],
      order: { appliedAt: 'DESC' },
    });
    return rows.map((r) => this.serializeVolunteerApplication(r));
  }

  async findProjectApplications(
    projectId: string,
    ngoAccountId: number,
  ): Promise<Record<string, unknown>[]> {
    const project = await this.projectsService.findEntityById(
      Number.parseInt(projectId, 10),
    );
    if (project.ngoId !== ngoAccountId) {
      throw new ForbiddenException('Access denied');
    }

    const rows = await this.applicationRepo.find({
      where: { projectId: project.id },
      relations: ['user', 'project', 'project.ngo'],
      order: { appliedAt: 'DESC' },
    });

    const out: Record<string, unknown>[] = [];
    for (const row of rows) {
      const id = String(row.id);
      out.push({
        _id: id,
        id,
        userId: await this.serializeVolunteerBrief(row.user),
        projectId: String(row.projectId),
        status: row.status,
        coverLetter: row.coverLetter ?? '',
        ngoFeedback: row.reviewNote ?? '',
        reviewedAt: row.reviewedAt,
        createdAt: row.appliedAt,
      });
    }
    return out;
  }

  async review(
    applicationId: string,
    reviewDto: ReviewApplicationDto,
    ngoAccountId: number,
  ): Promise<Record<string, unknown>> {
    const app = await this.applicationRepo.findOne({
      where: { id: Number.parseInt(applicationId, 10) },
      relations: ['project'],
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (!app.project || app.project.ngoId !== ngoAccountId) {
      throw new ForbiddenException('Access denied');
    }

    app.status = reviewDto.status;
    app.reviewNote = reviewDto.ngoFeedback ?? '';
    app.reviewedAt = new Date();

    if (reviewDto.status === ApplicationStatus.ACCEPTED) {
      await this.projectsService.incrementAcceptedCount(app.projectId);
    }

    await this.applicationRepo.save(app);
    const reloaded = await this.loadApplication(app.id);
    return this.serializeVolunteerApplication(reloaded);
  }

  async getApplicationStats(userId: number): Promise<Record<string, number>> {
    const total = await this.applicationRepo.count({ where: { userId } });
    const accepted = await this.applicationRepo.count({
      where: { userId, status: ApplicationStatus.ACCEPTED },
    });
    const pending = await this.applicationRepo.count({
      where: { userId, status: ApplicationStatus.PENDING },
    });
    const rejected = await this.applicationRepo.count({
      where: { userId, status: ApplicationStatus.REJECTED },
    });
    const withdrawn = await this.applicationRepo.count({
      where: { userId, status: ApplicationStatus.WITHDRAWN },
    });
    return { total, accepted, pending, rejected, withdrawn };
  }
}
