import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'access_logs' })
export class AccessLog extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  ip: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const AccessLogSchema = SchemaFactory.createForClass(AccessLog);
