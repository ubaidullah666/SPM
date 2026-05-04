import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProjectStatus } from '../../common/enums/status.enum';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ngoId: Types.ObjectId;

  @Prop({ default: '' })
  ngoName: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ default: '' })
  location: string;

  @Prop({ default: false })
  isRemote: boolean;

  @Prop({ enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @Prop({ default: 0 })
  volunteersNeeded: number;

  @Prop({ default: 0 })
  volunteersAccepted: number;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;

  @Prop({ default: 0 })
  estimatedHours: number;

  @Prop({ default: 0 })
  impactScore: number;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ default: 0 })
  totalApplications: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Text index for search
ProjectSchema.index({ title: 'text', description: 'text', category: 'text' });
