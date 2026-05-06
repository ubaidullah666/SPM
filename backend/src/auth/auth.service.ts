import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { NgosService } from '../ngos/ngos.service';
import type { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly ngosService: NgosService,
    private readonly jwtService: JwtService,
  ) {}

  private async assertEmailVacant(email: string): Promise<void> {
    const normalized = email.toLowerCase().trim();
    const existingUser =
      await this.usersService.findByEmailWithPassword(normalized);
    const existingNgo = await this.ngosService.findByEmail(normalized);
    if (existingUser || existingNgo) {
      throw new ConflictException('Email already registered');
    }
  }

  async register(createUserDto: CreateUserDto) {
    if (createUserDto.role === Role.ADMIN) {
      throw new BadRequestException('Cannot register as admin');
    }

    await this.assertEmailVacant(createUserDto.email);

    if (createUserDto.role === Role.NGO) {
      const ngo = await this.ngosService.createFromRegisterDto(createUserDto);
      const token = this.generateToken({
        sub: String(ngo.id),
        email: String(ngo.email),
        role: Role.NGO,
      });
      return {
        access_token: token,
        user: this.ngosService.toPublic(ngo),
      };
    }

    const user = await this.usersService.createVolunteer(createUserDto);
    const totals = await this.usersService.getImpactTotals(user.id);
    const token = this.generateToken({
      sub: String(user.id),
      email: user.email,
      role: user.role as Role,
    });

    const publicUser = this.usersService.toPublic(user, totals);

    return {
      access_token: token,
      user: publicUser,
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmailWithPassword(email);
    if (user?.isActive) {
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (isPasswordValid) {
        const token = this.generateToken({
          sub: String(user.id),
          email: user.email,
          role: user.role as Role,
        });
        const totals = await this.usersService.getImpactTotals(user.id);
        return {
          access_token: token,
          user: this.usersService.toPublic(user, totals),
        };
      }
    }

    const ngo = await this.ngosService.findByEmail(email);
    if (ngo?.password && ngo.status === 'active') {
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        ngo.password,
      );
      if (isPasswordValid) {
        const token = this.generateToken({
          sub: String(ngo.id),
          email: String(ngo.email),
          role: Role.NGO,
        });
        return {
          access_token: token,
          user: this.ngosService.toPublic(ngo),
        };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private generateToken(payload: {
    sub: string;
    email: string;
    role: Role;
  }): string {
    return this.jwtService.sign(payload);
  }
}
