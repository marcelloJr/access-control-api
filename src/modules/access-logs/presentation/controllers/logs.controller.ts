import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from '../../application/services/logs.service';
import { AccessLogResponseDto } from '../../application/dtos/access-log-response.dto';
import { SearchFilterDto } from '@/modules/shared/dtos/search-filter.dto';
import { PaginatedResponseDto } from '@/modules/shared/dtos/pagination.dto';
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
  @ApiOperation({ summary: 'Listar logs de acesso com paginação e filtros (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de logs de acesso',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async findAll(
    @Query() filterDto: SearchFilterDto,
  ): Promise<PaginatedResponseDto<AccessLogResponseDto>> {
    return this.logsService.findAllPaginated(filterDto);
  }
}
