import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiMatchingService } from './ai-matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('AI Matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-matching')
export class AiMatchingController {
  constructor(
    private readonly aiMatchingService: AiMatchingService,
    private readonly usersService: UsersService,
  ) {}

  @Get('suggestions')
  async getSuggestions(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    return this.aiMatchingService.getSuggestedProjects(user.skills);
  }

  @Post('analyze')
  async analyzeProject(@Body() projectData: any) {
    return this.aiMatchingService.sendToAiService(projectData);
  }
}
