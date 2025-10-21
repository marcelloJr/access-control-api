import { AccessLog } from '../entities/access-log.entity';

export interface ILogsRepository {
  create(log: Partial<AccessLog>): Promise<AccessLog>;
  findAll(): Promise<AccessLog[]>;
  findByUserId(userId: string): Promise<AccessLog[]>;
}
