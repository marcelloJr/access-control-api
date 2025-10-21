import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users/application/services/users.service';
import { LogsService } from '@/modules/access-logs/application/services/logs.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let logsService: LogsService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$HashedPasswordExample',
    role: 'user',
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockLogsService = {
    createAccessLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: LogsService, useValue: mockLogsService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    logsService = module.get<LogsService>(LogsService);

    jest.clearAllMocks();
  });

  describe('JWT Generation', () => {
    it('should generate a valid JWT token after successful login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const ip = '192.168.1.1';
      const expectedToken = 'valid.jwt.token';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue(expectedToken);
      mockLogsService.createAccessLog.mockResolvedValue(undefined);

      const result = await authService.login(loginDto, ip);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(expectedToken);
      expect(result.token_type).toBe('Bearer');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should include the correct information in the JWT payload', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue('token');
      mockLogsService.createAccessLog.mockResolvedValue(undefined);

      await authService.login(loginDto, ip);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('JWT Validation', () => {
    it('should validate correct credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await authService.validateUser('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('should return null for invalid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('Authentication with wrong password', () => {
    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(loginDto, ip)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto, ip)).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const loginDto = { email: 'notfound@example.com', password: 'password123' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockRejectedValue(new Error('User not found'));

      await expect(authService.login(loginDto, ip)).rejects.toThrow(UnauthorizedException);
    });

    it('should not generate token when authentication fails', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(loginDto, ip)).rejects.toThrow();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should not create access log when authentication fails', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(loginDto, ip)).rejects.toThrow();
      expect(logsService.createAccessLog).not.toHaveBeenCalled();
    });
  });

  describe('Access Log Registration', () => {
    it('should register access log after successful login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue('token');
      mockLogsService.createAccessLog.mockResolvedValue(undefined);

      await authService.login(loginDto, ip);

      expect(logsService.createAccessLog).toHaveBeenCalledWith(mockUser._id, ip);
      expect(logsService.createAccessLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('Token Expiration Time', () => {
    it('should return the correct expiration time for 1 day', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue('token');
      mockLogsService.createAccessLog.mockResolvedValue(undefined);

      process.env.JWT_EXPIRATION = '1d';
      const result = await authService.login(loginDto, ip);
      expect(result.expires_in).toBe(86400);
    });
  });
});
