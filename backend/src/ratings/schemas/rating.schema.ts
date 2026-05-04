import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  raterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  ratedUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', default: null })
  ratedProjectId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  score: number;

  @Prop({ default: '' })
  comment: string;

  @Prop({ required: true, enum: ['volunteer', 'project'] })
  type: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
