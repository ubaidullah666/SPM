import {
  Controller, Get, Post, Put, Param, Body, UseGuards, Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Contributions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.VOLUNTEER)
  create(@Request() req, @Body() createContributionDto: CreateContributionDto) {
    return this.contributionsService.create(createContributionDto, req.user.userId);
  }

  @Get('my')
  getMyContributions(@Request() req) {
    return this.contributionsService.findByUser(req.user.userId);
  }

  @Get('my/summary')
  getMyImpactSummary(@Request() req) {
    return this.contributionsService.getUserImpactSummary(req.user.userId);
  }

  @Get('project/:projectId')
  getProjectContributions(@Param('projectId') projectId: string) {
    return this.contributionsService.findByProject(projectId);
  }

  @Put(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(Role.NGO)
  verify(@Param('id') id: string, @Request() req) {
    return this.contributionsService.verify(id, req.user.userId);
  }
}
