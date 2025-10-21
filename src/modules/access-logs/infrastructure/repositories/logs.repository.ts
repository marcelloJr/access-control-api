import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { AccessLog } from '../../domain/entities/access-log.entity';
import { ILogsRepository } from '../../domain/repositories/logs.repository.interface';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';
import { User } from '@/modules/users/domain/entities/user.entity';

@Injectable()
export class LogsRepository implements ILogsRepository {
  constructor(
    @InjectModel(AccessLog.name) private readonly logModel: Model<AccessLog>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(logData: Partial<AccessLog>): Promise<AccessLog> {
    const log = new this.logModel(logData);
    return log.save();
  }

  async findAll(): Promise<AccessLog[]> {
    return this.logModel.find().populate('userId', 'name email').sort({ timestamp: -1 }).exec();
  }

  async findAllPaginated(
    filterDto: SearchFilterDto,
  ): Promise<{ logs: AccessLog[]; total: number }> {
    const { page = 1, limit = 10, search } = filterDto;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<AccessLog> = {};

    if (search) {
      const userFilter: FilterQuery<User> = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };

      const users = await this.userModel.find(userFilter).select('_id').exec();
      const userIds = users.map((user) => user._id);

      if (userIds.length > 0) {
        filter.userId = { $in: userIds };
      } else {
        return { logs: [], total: 0 };
      }
    }

    const [logs, total] = await Promise.all([
      this.logModel
        .find(filter)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);

    return { logs, total };
  }

  async findByUserId(userId: string): Promise<AccessLog[]> {
    return this.logModel
      .find({ userId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .exec();
  }
}
