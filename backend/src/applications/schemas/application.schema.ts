import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApplicationStatus } from '../../common/enums/status.enum';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @Prop({ default: '' })
  coverLetter: string;

  @Prop({ default: '' })
  ngoFeedback: string;

  @Prop({ default: null })
  reviewedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Unique constraint: one application per user per project
ApplicationSchema.index({ userId: 1, projectId: 1 }, { unique: true });
