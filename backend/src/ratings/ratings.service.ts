import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async create(createRatingDto: CreateRatingDto, raterId: string): Promise<RatingDocument> {
    const rating = new this.ratingModel({
      ...createRatingDto,
      raterId: new Types.ObjectId(raterId),
      ratedUserId: createRatingDto.ratedUserId
        ? new Types.ObjectId(createRatingDto.ratedUserId)
        : null,
      ratedProjectId: createRatingDto.ratedProjectId
        ? new Types.ObjectId(createRatingDto.ratedProjectId)
        : null,
    });
    return rating.save();
  }

  async getProjectRatings(projectId: string): Promise<any> {
    const ratings = await this.ratingModel
      .find({ ratedProjectId: new Types.ObjectId(projectId), type: 'project' })
      .populate('raterId', 'name avatar')
      .sort({ createdAt: -1 })
      .exec();

    const avg =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;

    return { ratings, average: Math.round(avg * 10) / 10, count: ratings.length };
  }

  async getUserRatings(userId: string): Promise<any> {
    const ratings = await this.ratingModel
      .find({ ratedUserId: new Types.ObjectId(userId), type: 'volunteer' })
      .populate('raterId', 'name avatar organizationName')
      .sort({ createdAt: -1 })
      .exec();

    const avg =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;

    return { ratings, average: Math.round(avg * 10) / 10, count: ratings.length };
  }
}
