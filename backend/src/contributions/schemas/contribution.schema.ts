import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContributionDocument = Contribution & Document;

@Schema({ timestamps: true })
export class Contribution {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  hours: number;

  @Prop({ default: 0 })
  impactScore: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  tasksCompleted: string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  verifiedBy: Types.ObjectId;
}

export const ContributionSchema = SchemaFactory.createForClass(Contribution);
