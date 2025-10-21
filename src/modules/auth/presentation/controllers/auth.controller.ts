import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar login e obter token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.authService.login(loginDto, ip);
  }
}
