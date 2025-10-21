import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/application/services/users.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LogsService } from '@/modules/access-logs/application/services/logs.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService,
  ) {}

  async login(loginDto: LoginDto, ip: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    await this.logsService.createAccessLog(user._id.toString(), ip);
    const expiresIn = this.getTokenExpirationTime();

    return new AuthResponseDto(accessToken, expiresIn);
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  private getTokenExpirationTime(): number {
    const expiration = process.env.JWT_EXPIRATION || '1d';
    if (expiration.endsWith('d')) {
      return parseInt(expiration) * 24 * 60 * 60;
    } else if (expiration.endsWith('h')) {
      return parseInt(expiration) * 60 * 60;
    }
    return 86400;
  }
}
