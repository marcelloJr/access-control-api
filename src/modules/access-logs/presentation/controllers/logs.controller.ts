import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from '../../application/services/logs.service';
import { AccessLogResponseDto } from '../../application/dtos/access-log-response.dto';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/infrastructure/guards/roles.guard';
import { Roles } from '@/modules/auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '@/modules/users/domain/entities/user.entity';

@ApiTags('logs')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os logs de acesso (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs de acesso',
    type: [AccessLogResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async findAll(): Promise<AccessLogResponseDto[]> {
    return this.logsService.findAll();
  }
}
