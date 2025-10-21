import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessLog } from '../../domain/entities/access-log.entity';
import { ILogsRepository } from '../../domain/repositories/logs.repository.interface';

@Injectable()
export class LogsRepository implements ILogsRepository {
  constructor(@InjectModel(AccessLog.name) private readonly logModel: Model<AccessLog>) {}

  async create(logData: Partial<AccessLog>): Promise<AccessLog> {
    const log = new this.logModel(logData);
    return log.save();
  }

  async findAll(): Promise<AccessLog[]> {
    return this.logModel.find().populate('userId', 'name email').sort({ timestamp: -1 }).exec();
  }

  async findByUserId(userId: string): Promise<AccessLog[]> {
    return this.logModel
      .find({ userId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .exec();
  }
}
