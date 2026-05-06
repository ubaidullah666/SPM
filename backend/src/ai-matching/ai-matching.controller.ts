import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiMatchingService } from './ai-matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
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
  @UseGuards(RolesGuard)
  @Roles(Role.VOLUNTEER)
  async getSuggestions(@Request() req: { user: { userId: string } }) {
    const profile = await this.usersService.findByIdPublic(
      Number.parseInt(req.user.userId, 10),
    );
    const skills = (profile.skills as string[]) ?? [];
    return this.aiMatchingService.getSuggestedProjects(skills);
  }

  @Post('analyze')
  async analyzeProject(@Body() projectData: Record<string, unknown>) {
    return this.aiMatchingService.sendToAiService(projectData);
  }
}
