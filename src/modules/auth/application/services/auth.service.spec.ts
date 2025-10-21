import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users/application/services/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService - TDD', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Geração de JWT', () => {
    it('deve gerar um token JWT válido após login bem-sucedido', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedToken = 'valid.jwt.token';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await authService.login(loginDto);

      // Assert
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
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password123' };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue('token');

      // Act
      await authService.login(loginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('Validação de JWT', () => {
    it('deve validar credenciais corretas', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await authService.validateUser('test@example.com', 'password123');

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('deve retornar null para credenciais inválidas', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act
      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Autenticação com senha incorreta', () => {
    it('deve lançar UnauthorizedException quando a senha está incorreta', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar UnauthorizedException quando o usuário não existe', async () => {
      // Arrange
      const loginDto = { email: 'notfound@example.com', password: 'password123' };

      mockUsersService.findByEmail.mockRejectedValue(new Error('Usuário não encontrado'));

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('não deve gerar token quando a autenticação falha', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
