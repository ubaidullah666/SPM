import {
  Injectable, NotFoundException, ForbiddenException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    ngoId: string,
    ngoName: string,
  ): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...createProjectDto,
      ngoId: new Types.ObjectId(ngoId),
      ngoName,
    });
    return project.save();
  }

  async findAll(query: any = {}): Promise<ProjectDocument[]> {
    const filter: any = { isActive: true };

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }
    if (query.skills) {
      const skillsArray = Array.isArray(query.skills)
        ? query.skills
        : query.skills.split(',');
      filter.requiredSkills = { $in: skillsArray };
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.isRemote !== undefined) {
      filter.isRemote = query.isRemote === 'true';
    }

    return this.projectModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project || !project.isActive) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findByNgo(ngoId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ ngoId: new Types.ObjectId(ngoId), isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    const project = await this.findById(id);
    if (project.ngoId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own projects');
    }
    return this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .exec();
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findById(id);
    if (project.ngoId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }
    await this.projectModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async incrementApplicationCount(id: string): Promise<void> {
    await this.projectModel
      .findByIdAndUpdate(id, { $inc: { totalApplications: 1 } })
      .exec();
  }

  async incrementAcceptedCount(id: string): Promise<void> {
    await this.projectModel
      .findByIdAndUpdate(id, { $inc: { volunteersAccepted: 1 } })
      .exec();
  }

  async getStats(): Promise<any> {
    const total = await this.projectModel.countDocuments({ isActive: true });
    const open = await this.projectModel.countDocuments({ isActive: true, status: 'open' });
    const ongoing = await this.projectModel.countDocuments({ isActive: true, status: 'ongoing' });
    const completed = await this.projectModel.countDocuments({ isActive: true, status: 'completed' });
    return { total, open, ongoing, completed };
  }
}
