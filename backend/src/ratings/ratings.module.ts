import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { ProjectFeedbackEntity } from '../entities/project-feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectFeedbackEntity])],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
