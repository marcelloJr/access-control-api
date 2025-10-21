import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '@/modules/users/domain/entities/user.entity';
import { IUsersRepository } from '@/modules/users/domain/repositories/users.repository.interface';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findAllPaginated(filterDto: SearchFilterDto): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search } = filterDto;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<User> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter).select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { users, total };
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, userData, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
