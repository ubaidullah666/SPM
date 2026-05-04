import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.VOLUNTEER })
  role: Role;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  location: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: 0 })
  totalHours: number;

  @Prop({ default: 0 })
  impactScore: number;

  @Prop({ default: 0 })
  projectsCompleted: number;

  // NGO-specific fields
  @Prop({ default: '' })
  organizationName: string;

  @Prop({ default: '' })
  website: string;

  @Prop({ default: '' })
  mission: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
