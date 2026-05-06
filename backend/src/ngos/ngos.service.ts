import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { NgoEntity } from '../entities/ngo.entity';
import type { CreateUserDto } from '../users/dto/create-user.dto';
import type { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class NgosService {
  constructor(
    @InjectRepository(NgoEntity)
    private readonly ngoRepo: Repository<NgoEntity>,
  ) {}

  toPublic(ngo: NgoEntity): Record<string, unknown> {
    return {
      id: String(ngo.id),
      _id: String(ngo.id),
      name: ngo.name,
      email: ngo.email,
      role: 'ngo',
      skills: [] as string[],
      impactScore: 0,
      totalHours: 0,
      organizationName: ngo.name,
      website: ngo.websiteUrl ?? '',
      mission: ngo.description ?? '',
      avatar: '',
    };
  }

  async createFromRegisterDto(dto: CreateUserDto): Promise<NgoEntity> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.ngoRepo.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const displayName =
      (dto.organizationName && dto.organizationName.trim()) ||
      dto.name.trim();

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const ngo = this.ngoRepo.create({
      name: displayName,
      email: normalizedEmail,
      password: hashedPassword,
      description: dto.mission ?? dto.bio ?? null,
      websiteUrl: dto.website ?? null,
      status: 'active',
      isVerified: false,
    });
    return this.ngoRepo.save(ngo);
  }

  async findByEmail(email: string): Promise<NgoEntity | null> {
    return this.ngoRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findOptionalById(id: number): Promise<NgoEntity | null> {
    return this.ngoRepo.findOne({ where: { id } });
  }

  async findById(id: number): Promise<NgoEntity> {
    const ngo = await this.ngoRepo.findOne({ where: { id } });
    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }
    return ngo;
  }

  async updateProfile(
    ngoId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Record<string, unknown>> {
    const ngo = await this.findById(ngoId);
    if (updateUserDto.name !== undefined) {
      ngo.name = updateUserDto.name;
    }
    if (updateUserDto.organizationName !== undefined) {
      ngo.name = updateUserDto.organizationName;
    }
    if (updateUserDto.mission !== undefined) {
      ngo.description = updateUserDto.mission;
    }
    if (updateUserDto.website !== undefined) {
      ngo.websiteUrl = updateUserDto.website;
    }
    const saved = await this.ngoRepo.save(ngo);
    return this.toPublic(saved);
  }
}
