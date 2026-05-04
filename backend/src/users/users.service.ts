import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();

    const existing = await this.userModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = new this.userModel({
      ...createUserDto,
      email: normalizedEmail,
      password: hashedPassword,
    });
    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ isActive: true }).select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateStats(
    id: string,
    hours: number,
    impactScore: number,
    incrementProjects = false,
  ): Promise<void> {
    const update: any = {
      $inc: { totalHours: hours, impactScore: impactScore },
    };
    if (incrementProjects) {
      update.$inc.projectsCompleted = 1;
    }
    await this.userModel.findByIdAndUpdate(id, update).exec();
  }

  async getLeaderboard(): Promise<UserDocument[]> {
    return this.userModel
      .find({ isActive: true })
      .select('-password')
      .sort({ impactScore: -1 })
      .limit(20)
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }
}
