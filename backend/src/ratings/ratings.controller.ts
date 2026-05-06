import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: { user: { userId: string } },
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const uid = Number.parseInt(req.user.userId, 10);
    return this.ratingsService.create(createRatingDto, uid);
  }

  @Get('project/:projectId')
  getProjectRatings(@Param('projectId') projectId: string) {
    return this.ratingsService.getProjectRatings(projectId);
  }

  @Get('user/:userId')
  getUserRatings(@Param('userId') userId: string) {
    return this.ratingsService.getUserRatings(userId);
  }
}
