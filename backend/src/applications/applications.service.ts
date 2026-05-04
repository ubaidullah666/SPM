import {
  Injectable, NotFoundException, ForbiddenException, ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { ProjectsService } from '../projects/projects.service';
import { ApplicationStatus } from '../common/enums/status.enum';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    private projectsService: ProjectsService,
  ) {}

  async apply(
    createApplicationDto: CreateApplicationDto,
    userId: string,
  ): Promise<ApplicationDocument> {
    const project = await this.projectsService.findById(
      createApplicationDto.projectId,
    );

    // Check if already applied
    const existing = await this.applicationModel.findOne({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(createApplicationDto.projectId),
    });
    if (existing) {
      throw new ConflictException('You have already applied to this project');
    }

    const application = new this.applicationModel({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(createApplicationDto.projectId),
      coverLetter: createApplicationDto.coverLetter || '',
    });

    await this.projectsService.incrementApplicationCount(
      createApplicationDto.projectId,
    );

    return application.save();
  }

  async findMyApplications(userId: string): Promise<ApplicationDocument[]> {
    return this.applicationModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('projectId', 'title category status ngoName imageUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findProjectApplications(
    projectId: string,
    ngoId: string,
  ): Promise<ApplicationDocument[]> {
    const project = await this.projectsService.findById(projectId);
    if (project.ngoId.toString() !== ngoId) {
      throw new ForbiddenException('Access denied');
    }

    return this.applicationModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('userId', 'name email skills impactScore totalHours avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async review(
    applicationId: string,
    reviewDto: ReviewApplicationDto,
    ngoId: string,
  ): Promise<ApplicationDocument> {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('projectId')
      .exec();

    if (!application) throw new NotFoundException('Application not found');

    const project = application.projectId as any;
    if (project.ngoId.toString() !== ngoId) {
      throw new ForbiddenException('Access denied');
    }

    application.status = reviewDto.status;
    application.ngoFeedback = reviewDto.ngoFeedback || '';
    application.reviewedAt = new Date();

    if (reviewDto.status === ApplicationStatus.ACCEPTED) {
      await this.projectsService.incrementAcceptedCount(project._id.toString());
    }

    return application.save();
  }

  async findById(id: string): Promise<ApplicationDocument> {
    const app = await this.applicationModel.findById(id).exec();
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async getApplicationStats(userId: string): Promise<any> {
    const total = await this.applicationModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
    const accepted = await this.applicationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: ApplicationStatus.ACCEPTED,
    });
    const pending = await this.applicationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: ApplicationStatus.PENDING,
    });
    return { total, accepted, pending, rejected: total - accepted - pending };
  }
}
