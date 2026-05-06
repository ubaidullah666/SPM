import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectFeedbackEntity } from '../entities/project-feedback.entity';
import type { CreateRatingDto } from './dto/create-rating.dto';
import { stringId } from '../common/serialize';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(ProjectFeedbackEntity)
    private readonly feedbackRepo: Repository<ProjectFeedbackEntity>,
  ) {}

  async create(
    createRatingDto: CreateRatingDto,
    raterUserId: number,
  ): Promise<Record<string, unknown>> {
    if (createRatingDto.type === 'project' && createRatingDto.ratedProjectId) {
      const row = this.feedbackRepo.create({
        projectId: Number.parseInt(createRatingDto.ratedProjectId, 10),
        userId: raterUserId,
        rating: createRatingDto.score,
        comment: createRatingDto.comment ?? null,
      });
      const saved = await this.feedbackRepo.save(row);
      const id = stringId(saved.id);
      return {
        _id: id,
        id,
        userId: String(saved.userId),
        projectId: String(saved.projectId),
        score: saved.rating,
        comment: saved.comment ?? '',
        type: createRatingDto.type,
        createdAt: saved.createdAt,
      };
    }

    throw new BadRequestException(
      'Only project feedback is supported with the current PostgreSQL schema.',
    );
  }

  async getProjectRatings(projectId: string): Promise<Record<string, unknown>> {
    const pid = Number.parseInt(projectId, 10);
    const rows = await this.feedbackRepo.find({
      where: { projectId: pid },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const ratings = rows.map((r) => {
      const uid = stringId(r.userId);
      return {
        _id: stringId(r.id),
        score: r.rating,
        comment: r.comment ?? '',
        raterId: {
          _id: uid,
          name: r.user.fullName,
          avatar: r.user.profileImage ?? '',
        },
        createdAt: r.createdAt,
      };
    });

    const avg =
      ratings.length > 0
        ? ratings.reduce((sum, row) => sum + Number(row.score), 0) / ratings.length
        : 0;

    return {
      ratings,
      average: Math.round(avg * 10) / 10,
      count: ratings.length,
    };
  }

  /** Schema has no volunteer rating table — return empty structure for portfolio. */
  async getUserRatings(_userId: string): Promise<Record<string, unknown>> {
    return { ratings: [], average: 0, count: 0 };
  }
}
