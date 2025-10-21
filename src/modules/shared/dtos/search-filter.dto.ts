import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SearchFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Buscar por nome ou email',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
