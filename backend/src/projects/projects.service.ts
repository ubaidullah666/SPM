import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ProjectEntity } from '../entities/project.entity';
import { NgoEntity } from '../entities/ngo.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { serializeProject } from '../common/serialize';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(NgoEntity)
    private readonly ngoRepo: Repository<NgoEntity>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    ngoId: number,
  ): Promise<Record<string, unknown>> {
    const ngo = await this.ngoRepo.findOne({ where: { id: ngoId } });
    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    const project = this.projectRepo.create({
      ngoId,
      title: createProjectDto.title,
      description: createProjectDto.description,
      category: createProjectDto.category,
      requiredSkills: createProjectDto.requiredSkills ?? [],
      location: createProjectDto.location ?? '',
      isRemote: createProjectDto.isRemote ?? false,
      volunteersNeeded:
        createProjectDto.volunteersNeeded && createProjectDto.volunteersNeeded > 0
          ? createProjectDto.volunteersNeeded
          : 1,
      volunteersAccepted: 0,
      totalApplications: 0,
      startDate: createProjectDto.startDate
        ? new Date(createProjectDto.startDate)
        : null,
      endDate: createProjectDto.endDate
        ? new Date(createProjectDto.endDate)
        : null,
      estimatedHours: createProjectDto.estimatedHours ?? 0,
      imageUrl: createProjectDto.imageUrl ?? null,
      status: 'open',
      isActive: true,
    });

    const saved = await this.projectRepo.save(project);
    const withNgo = await this.findEntityById(saved.id);
    return serializeProject(withNgo);
  }

  async findAll(query: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const qb = this.projectRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.ngo', 'ngo')
      .where('p.is_active = :active', { active: true });

    if (typeof query.search === 'string' && query.search.trim()) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere(
        new Brackets((q) =>
          q
            .where('p.title ILIKE :s', { s })
            .orWhere('p.description ILIKE :s', { s })
            .orWhere('p.category ILIKE :s', { s }),
        ),
      );
    }
    if (typeof query.category === 'string' && query.category) {
      qb.andWhere('p.category ILIKE :cat', { cat: `%${query.category}%` });
    }
    if (typeof query.skills === 'string' && query.skills) {
      qb.andWhere(':skill = ANY(p.required_skills)', {
        skill: query.skills,
      });
    }
    if (typeof query.status === 'string' && query.status) {
      qb.andWhere('p.status = :st', { st: query.status });
    } else {
      qb.andWhere('p.status != :draft', { draft: 'draft' });
    }
    if (query.isRemote !== undefined && query.isRemote !== '') {
      qb.andWhere('p.is_remote = :remote', {
        remote: query.isRemote === 'true',
      });
    }

    qb.orderBy('p.createdAt', 'DESC');
    const rows = await qb.getMany();
    return rows.map((p) => serializeProject(p));
  }

  async findEntityById(id: number): Promise<ProjectEntity> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['ngo'],
    });
    if (!project || !project.isActive) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findById(id: string): Promise<Record<string, unknown>> {
    const project = await this.findEntityById(Number.parseInt(id, 10));
    return serializeProject(project);
  }

  async findByNgo(ngoId: number): Promise<Record<string, unknown>[]> {
    const rows = await this.projectRepo.find({
      where: { ngoId, isActive: true },
      relations: ['ngo'],
      order: { createdAt: 'DESC' },
    });
    return rows.map((p) => serializeProject(p));
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    ngoAccountId: number,
  ): Promise<Record<string, unknown>> {
    const project = await this.findEntityById(Number.parseInt(id, 10));
    if (project.ngoId !== ngoAccountId) {
      throw new ForbiddenException('You can only edit your own projects');
    }

    if (updateProjectDto.title !== undefined) {
      project.title = updateProjectDto.title;
    }
    if (updateProjectDto.description !== undefined) {
      project.description = updateProjectDto.description;
    }
    if (updateProjectDto.category !== undefined) {
      project.category = updateProjectDto.category;
    }
    if (updateProjectDto.requiredSkills !== undefined) {
      project.requiredSkills = updateProjectDto.requiredSkills;
    }
    if (updateProjectDto.location !== undefined) {
      project.location = updateProjectDto.location;
    }
    if (updateProjectDto.isRemote !== undefined) {
      project.isRemote = updateProjectDto.isRemote;
    }
    if (updateProjectDto.status !== undefined) {
      project.status = updateProjectDto.status;
    }
    if (updateProjectDto.volunteersNeeded !== undefined) {
      project.volunteersNeeded =
        updateProjectDto.volunteersNeeded > 0
          ? updateProjectDto.volunteersNeeded
          : 1;
    }
    if (updateProjectDto.startDate !== undefined) {
      project.startDate = updateProjectDto.startDate
        ? new Date(updateProjectDto.startDate)
        : null;
    }
    if (updateProjectDto.endDate !== undefined) {
      project.endDate = updateProjectDto.endDate
        ? new Date(updateProjectDto.endDate)
        : null;
    }
    if (updateProjectDto.estimatedHours !== undefined) {
      project.estimatedHours = updateProjectDto.estimatedHours;
    }
    if (updateProjectDto.imageUrl !== undefined) {
      project.imageUrl = updateProjectDto.imageUrl;
    }

    await this.projectRepo.save(project);
    const reloaded = await this.findEntityById(project.id);
    return serializeProject(reloaded);
  }

  async remove(id: string, ngoAccountId: number): Promise<void> {
    const project = await this.findEntityById(Number.parseInt(id, 10));
    if (project.ngoId !== ngoAccountId) {
      throw new ForbiddenException('You can only delete your own projects');
    }
    project.isActive = false;
    await this.projectRepo.save(project);
  }

  async incrementApplicationCount(idNum: number): Promise<void> {
    await this.projectRepo.increment({ id: idNum }, 'totalApplications', 1);
  }

  async incrementAcceptedCount(idNum: number): Promise<void> {
    await this.projectRepo.increment({ id: idNum }, 'volunteersAccepted', 1);
  }

  async getStats(): Promise<Record<string, number>> {
    const total = await this.projectRepo.count({
      where: { isActive: true },
    });
    const open = await this.projectRepo.count({
      where: { isActive: true, status: 'open' },
    });
    const ongoing = await this.projectRepo.count({
      where: { isActive: true, status: 'ongoing' },
    });
    const completed = await this.projectRepo.count({
      where: { isActive: true, status: 'completed' },
    });
    return { total, open, ongoing, completed };
  }
}
