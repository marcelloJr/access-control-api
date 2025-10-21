import { AccessLog } from '../entities/access-log.entity';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';

export interface ILogsRepository {
  create(log: Partial<AccessLog>): Promise<AccessLog>;
  findAll(): Promise<AccessLog[]>;
  findAllPaginated(filterDto: SearchFilterDto): Promise<{ logs: AccessLog[]; total: number }>;
  findByUserId(userId: string): Promise<AccessLog[]>;
}
