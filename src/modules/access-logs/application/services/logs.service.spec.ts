import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { LogsService } from '@/modules/access-logs/application/services/logs.service';
import { LogsRepository } from '@/modules/access-logs/infrastructure/repositories/logs.repository';
import { AccessLogResponseDto } from '@/modules/access-logs/application/dtos/access-log-response.dto';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';

describe('LogsService', () => {
  let service: LogsService;
  let logsRepository: jest.Mocked<LogsRepository>;

  const mockLogsRepository = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    findByUserId: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        {
          provide: LogsRepository,
          useFactory: mockLogsRepository,
        },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
    logsRepository = module.get(LogsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccessLog', () => {
    it('should create an access log', async () => {
      const userId = new Types.ObjectId().toString();
      const ip = '192.168.1.1';

      await service.createAccessLog(userId, ip);

      expect(logsRepository.create).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        ip,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('findAll', () => {
    it('should return a list of logs', async () => {
      const mockLogs = [
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          ip: '192.168.1.1',
          timestamp: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          ip: '192.168.1.2',
          timestamp: new Date(),
        },
      ];

      logsRepository.findAll.mockResolvedValue(mockLogs as any);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(AccessLogResponseDto);
      expect(logsRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated logs', async () => {
      const mockLogs = [
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          ip: '192.168.1.1',
          timestamp: new Date(),
        },
      ];

      const mockPaginatedResult = {
        logs: mockLogs,
        total: 1,
      };

      logsRepository.findAllPaginated.mockResolvedValue(mockPaginatedResult as any);

      const filterDto: SearchFilterDto = { page: 1, limit: 10 };
      const result = await service.findAllPaginated(filterDto);

      expect(result).toBeInstanceOf(Object);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(AccessLogResponseDto);
      expect(logsRepository.findAllPaginated).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findByUserId', () => {
    it('should return logs by user ID', async () => {
      const userId = new Types.ObjectId().toString();
      const mockLogs = [
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          ip: '192.168.1.1',
          timestamp: new Date(),
        },
      ];

      logsRepository.findByUserId.mockResolvedValue(mockLogs as any);

      const result = await service.findByUserId(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AccessLogResponseDto);
      expect(logsRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
