import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { LogsRepository } from '../../infrastructure/repositories/logs.repository';
import { AccessLogResponseDto } from '../dtos/access-log-response.dto';

@Injectable()
export class LogsService {
  constructor(private readonly logsRepository: LogsRepository) {}

  async createAccessLog(userId: string, ip: string): Promise<void> {
    await this.logsRepository.create({
      userId: new Types.ObjectId(userId),
      ip,
      timestamp: new Date(),
    });
  }

  async findAll(): Promise<AccessLogResponseDto[]> {
    const logs = await this.logsRepository.findAll();
    return logs.map((log) => new AccessLogResponseDto(log));
  }

  async findByUserId(userId: string): Promise<AccessLogResponseDto[]> {
    const logs = await this.logsRepository.findByUserId(userId);
    return logs.map((log) => new AccessLogResponseDto(log));
  }
}
