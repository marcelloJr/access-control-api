import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { LogsRepository } from '../../infrastructure/repositories/logs.repository';
import { AccessLogResponseDto } from '../dtos/access-log-response.dto';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';
import { PaginatedResponseDto } from '@/modules/shared/dtos/pagination.dto';

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

  async findAllPaginated(
    filterDto: SearchFilterDto,
  ): Promise<PaginatedResponseDto<AccessLogResponseDto>> {
    const { page = 1, limit = 10 } = filterDto;
    const { logs, total } = await this.logsRepository.findAllPaginated(filterDto);

    const items = logs.map((log) => new AccessLogResponseDto(log));
    return new PaginatedResponseDto<AccessLogResponseDto>(items, total, page, limit);
  }

  async findByUserId(userId: string): Promise<AccessLogResponseDto[]> {
    const logs = await this.logsRepository.findByUserId(userId);
    return logs.map((log) => new AccessLogResponseDto(log));
  }
}
