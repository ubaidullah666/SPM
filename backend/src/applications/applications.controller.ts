import {
  Controller, Get, Post, Put, Param, Body, UseGuards, Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.VOLUNTEER)
  apply(@Request() req, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.apply(createApplicationDto, req.user.userId);
  }

  @Get('my')
  getMyApplications(@Request() req) {
    return this.applicationsService.findMyApplications(req.user.userId);
  }

  @Get('my/stats')
  getMyStats(@Request() req) {
    return this.applicationsService.getApplicationStats(req.user.userId);
  }

  @Get('project/:projectId')
  @UseGuards(RolesGuard)
  @Roles(Role.NGO)
  getProjectApplications(@Param('projectId') projectId: string, @Request() req) {
    return this.applicationsService.findProjectApplications(
      projectId,
      req.user.userId,
    );
  }

  @Put(':id/review')
  @UseGuards(RolesGuard)
  @Roles(Role.NGO)
  review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewApplicationDto,
    @Request() req,
  ) {
    return this.applicationsService.review(id, reviewDto, req.user.userId);
  }
}
