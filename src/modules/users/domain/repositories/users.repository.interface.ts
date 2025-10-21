import { User } from '../entities/user.entity';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';

export interface IUsersRepository {
  create(user: Partial<User>): Promise<User>;
  findAll(): Promise<User[]>;
  findAllPaginated(filterDto: SearchFilterDto): Promise<{ users: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
