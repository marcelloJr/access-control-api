import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from '@/modules/users/application/services/users.service';
import { CreateUserDto } from '@/modules/users/application/dtos/create-user.dto';
import { UserResponseDto } from '@/modules/users/application/dtos/user-response.dto';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/infrastructure/guards/roles.guard';
import { Roles } from '@/modules/auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '@/modules/users/domain/entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
