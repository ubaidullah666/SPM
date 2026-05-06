import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.projectsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.projectsService.getStats();
  }

  @Get('my-projects')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NGO)
  getMyProjects(@Request() req: { user: { userId: string } }) {
    const ngoId = Number.parseInt(req.user.userId, 10);
    return this.projectsService.findByNgo(ngoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NGO)
  create(
    @Request() req: { user: { userId: string } },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const ngoId = Number.parseInt(req.user.userId, 10);
    return this.projectsService.create(createProjectDto, ngoId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NGO)
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: { user: { userId: string } },
  ) {
    const ngoId = Number.parseInt(req.user.userId, 10);
    return this.projectsService.update(id, updateProjectDto, ngoId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NGO)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    const ngoId = Number.parseInt(req.user.userId, 10);
    return this.projectsService.remove(id, ngoId);
  }
}
