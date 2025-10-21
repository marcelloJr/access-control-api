import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '@/modules/users/infrastructure/repositories/users.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '@/modules/users/domain/entities/user.entity';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';
import { PaginatedResponseDto } from '@/modules/shared/dtos/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado no sistema');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return new UserResponseDto(user.toObject());
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => new UserResponseDto(user.toObject()));
  }

  async findAllPaginated(
    filterDto: SearchFilterDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page = 1, limit = 10 } = filterDto;
    const { users, total } = await this.usersRepository.findAllPaginated(filterDto);

    const items = users.map((user) => new UserResponseDto(user.toObject()));
    return new PaginatedResponseDto<UserResponseDto>(items, total, page, limit);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
}
