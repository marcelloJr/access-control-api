import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users/application/services/users.service';
import { LogsService } from '@/modules/access-logs/application/services/logs.service';
import * as bcrypt from 'bcrypt';

describe('AuthService - TDD', () => {
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

  describe('Geração de JWT', () => {
    it('deve gerar um token JWT válido após login bem-sucedido', async () => {
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

    it('deve incluir as informações corretas no payload do JWT', async () => {
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

  describe('Validação de JWT', () => {
    it('deve validar credenciais corretas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await authService.validateUser('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('deve retornar null para credenciais inválidas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('Autenticação com senha incorreta', () => {
    it('deve lançar UnauthorizedException quando a senha está incorreta', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(loginDto, ip)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto, ip)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar UnauthorizedException quando o usuário não existe', async () => {
      const loginDto = { email: 'notfound@example.com', password: 'password123' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockRejectedValue(new Error('Usuário não encontrado'));

      await expect(authService.login(loginDto, ip)).rejects.toThrow(UnauthorizedException);
    });

    it('não deve gerar token quando a autenticação falha', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(loginDto, ip)).rejects.toThrow();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('não deve criar log de acesso quando a autenticação falha', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const ip = '192.168.1.1';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(loginDto, ip)).rejects.toThrow();
      expect(logsService.createAccessLog).not.toHaveBeenCalled();
    });
  });

  describe('Registro de log de acesso', () => {
    it('deve registrar log de acesso após login bem-sucedido', async () => {
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

  describe('Tempo de expiração do token', () => {
    it('deve retornar o tempo de expiração correto para 1 dia', async () => {
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
