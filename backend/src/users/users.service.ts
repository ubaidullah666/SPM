import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';
import { ContributionEntity } from '../entities/contribution.entity';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ContributionEntity)
    private readonly contributionRepo: Repository<ContributionEntity>,
  ) {}

  async getImpactTotals(
    userId: number,
  ): Promise<{ totalHours: number; impactScore: number }> {
    return this.totalsForUser(userId);
  }

  private async totalsForUser(
    userId: number,
  ): Promise<{ totalHours: number; impactScore: number }> {
    const raw = await this.contributionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.hours), 0)', 'totalHours')
      .addSelect('COALESCE(SUM(c.impactScore), 0)', 'impactScore')
      .where('c.userId = :uid', { uid: userId })
      .getRawOne<{ totalHours: string; impactScore: string }>();

    const totalHours = Number.parseFloat(raw?.totalHours ?? '0');
    const impactScore = Number.parseInt(raw?.impactScore ?? '0', 10);
    return { totalHours, impactScore };
  }

  toPublic(user: UserEntity, totals?: { totalHours: number; impactScore: number }): Record<string, unknown> {
    const hours = totals?.totalHours ?? 0;
    const impact = totals?.impactScore ?? 0;
    const id = String(user.id);
    return {
      id,
      _id: id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      bio: user.bio ?? '',
      location: user.location ?? '',
      skills: user.skills ?? [],
      avatar: user.profileImage ?? '',
      organizationName: '',
      website: '',
      mission: '',
      totalHours: hours,
      impactScore: impact,
    };
  }

  async createVolunteer(createUserDto: CreateUserDto): Promise<UserEntity> {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();
    const existing = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = this.userRepo.create({
      fullName: createUserDto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'volunteer',
      bio: createUserDto.bio ?? null,
      location: createUserDto.location ?? null,
      skills: createUserDto.skills ?? [],
      isActive: true,
    });
    return this.userRepo.save(user);
  }

  async findAllPublic(): Promise<Record<string, unknown>[]> {
    const rows = await this.userRepo.find({
      where: { isActive: true },
      select: [
        'id',
        'fullName',
        'email',
        'role',
        'bio',
        'location',
        'skills',
        'profileImage',
        'createdAt',
      ],
    });

    const out: Record<string, unknown>[] = [];
    for (const u of rows) {
      const totals = await this.totalsForUser(u.id);
      out.push({
        ...(this.toPublic(u, totals)),
        password: undefined,
      });
    }
    return out;
  }

  async findByIdPublic(idNum: number): Promise<Record<string, unknown>> {
    const user = await this.userRepo.findOne({ where: { id: idNum } });
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }
    const totals = await this.totalsForUser(user.id);
    return this.toPublic(user, totals);
  }

  /** Internal: JWT validation + password lookup */
  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByIdPlain(idNum: number): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id: idNum } });
  }

  async update(
    idNum: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Record<string, unknown>> {
    const user = await this.userRepo.findOne({ where: { id: idNum } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.name !== undefined) {
      user.fullName = updateUserDto.name;
    }
    if (updateUserDto.bio !== undefined) {
      user.bio = updateUserDto.bio;
    }
    if (updateUserDto.location !== undefined) {
      user.location = updateUserDto.location;
    }
    if (updateUserDto.avatar !== undefined) {
      user.profileImage = updateUserDto.avatar;
    }
    if (updateUserDto.skills !== undefined) {
      user.skills = updateUserDto.skills;
    }

    await this.userRepo.save(user);
    const totals = await this.totalsForUser(user.id);
    return this.toPublic(user, totals);
  }

  async getLeaderboard(): Promise<Record<string, unknown>[]> {
    const users = await this.userRepo.find({
      where: { isActive: true, role: 'volunteer' as const },
    });
    const withTotals = await Promise.all(
      users.map(async (u) => {
        const totals = await this.totalsForUser(u.id);
        return { user: u, totals };
      }),
    );

    return withTotals
      .sort((a, b) => b.totals.impactScore - a.totals.impactScore)
      .slice(0, 20)
      .map(({ user, totals }) => this.toPublic(user, totals));
  }

  async remove(idNum: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: idNum } });
    if (user && user.role !== Role.ADMIN) {
      user.isActive = false;
      await this.userRepo.save(user);
    }
  }
}
