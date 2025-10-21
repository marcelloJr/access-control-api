import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/application/services/users.service';
import { UsersRepository } from '@/modules/users/infrastructure/repositories/users.repository';
import { CreateUserDto } from '@/modules/users/application/dtos/create-user.dto';
import { UserResponseDto } from '@/modules/users/application/dtos/user-response.dto';
import { User, UserRole } from '@/modules/users/domain/entities/user.entity';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';
import { PaginatedResponseDto } from '@/modules/shared/dtos/pagination.dto';

// bcrypt mock
jest.mock('bcrypt');

const mockUser: Partial<User> = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  toObject: function () {
    return this;
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockUsersRepository = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useFactory: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);

    // Mock bcrypt hash function
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
    };

    it('should create a new user successfully', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser as User);

      const result = await service.create(createUserDto);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedpassword',
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw an error when email is already in use', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as User);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        mockUser,
        { ...mockUser, _id: '507f1f77bcf86cd799439012', email: 'test2@example.com' },
      ];
      usersRepository.findAll.mockResolvedValue(users as User[]);

      const result = await service.findAll();

      expect(usersRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[0].email).toBe(users[0].email);
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      const paginatedResult = {
        users,
        total: 1,
      };

      usersRepository.findAllPaginated.mockResolvedValue(paginatedResult as any);

      const filterDto: SearchFilterDto = { page: 1, limit: 10 };
      const result = await service.findAllPaginated(filterDto);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(UserResponseDto);
      expect(usersRepository.findAllPaginated).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      usersRepository.findById.mockResolvedValue(mockUser as User);

      const result = await service.findById(mockUser._id.toString());

      expect(usersRepository.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw an error when user is not found', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser as User);

      const result = await service.findByEmail(mockUser.email);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw an error when email is not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
