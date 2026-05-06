import {
  Controller, Get, Put, Delete, Param, Body,
  UseGuards, Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { NgosService } from '../ngos/ngos.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ngosService: NgosService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAllPublic();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === Role.NGO) {
      const ngo = await this.ngosService.findById(Number.parseInt(req.user.userId, 10));
      return this.ngosService.toPublic(ngo);
    }
    return this.usersService.findByIdPublic(Number.parseInt(req.user.userId, 10));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findByIdPublic(Number.parseInt(id, 10));
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: { user: { userId: string; role: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (req.user.role === Role.NGO) {
      return this.ngosService.updateProfile(
        Number.parseInt(req.user.userId, 10),
        updateUserDto,
      );
    }
    return this.usersService.update(
      Number.parseInt(req.user.userId, 10),
      updateUserDto,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(Number.parseInt(id, 10), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number.parseInt(id, 10));
  }
}
