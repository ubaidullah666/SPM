import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contribution, ContributionDocument } from './schemas/contribution.schema';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectModel(Contribution.name)
    private contributionModel: Model<ContributionDocument>,
    private usersService: UsersService,
  ) {}

  // Calculate impact score based on hours (simple formula)
  private calculateImpactScore(hours: number): number {
    return Math.round(hours * 10);
  }

  async create(
    createContributionDto: CreateContributionDto,
    userId: string,
  ): Promise<ContributionDocument> {
    const impactScore = this.calculateImpactScore(createContributionDto.hours);

    const contribution = new this.contributionModel({
      ...createContributionDto,
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(createContributionDto.projectId),
      impactScore,
    });

    const saved = await contribution.save();

    // Update user stats automatically
    await this.usersService.updateStats(userId, createContributionDto.hours, impactScore);

    return saved;
  }

  async findByUser(userId: string): Promise<ContributionDocument[]> {
    return this.contributionModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('projectId', 'title category ngoName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProject(projectId: string): Promise<ContributionDocument[]> {
    return this.contributionModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async verify(id: string, verifierId: string): Promise<ContributionDocument> {
    const contribution = await this.contributionModel.findById(id);
    if (!contribution) throw new NotFoundException('Contribution not found');

    contribution.isVerified = true;
    contribution.verifiedBy = new Types.ObjectId(verifierId);
    return contribution.save();
  }

  async getUserImpactSummary(userId: string): Promise<any> {
    const contributions = await this.contributionModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();

    const totalHours = contributions.reduce((sum, c) => sum + c.hours, 0);
    const totalImpact = contributions.reduce((sum, c) => sum + c.impactScore, 0);
    const projectCount = new Set(contributions.map((c) => c.projectId.toString())).size;

    return {
      totalHours,
      totalImpact,
      projectCount,
      contributionCount: contributions.length,
    };
  }
}
