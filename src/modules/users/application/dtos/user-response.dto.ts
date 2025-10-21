import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '@/modules/users/domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'João Silva' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'joao@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'user', enum: UserRole })
  @Expose()
  role: UserRole;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
    if (partial['_id']) {
      this.id = partial['_id'].toString();
    }
  }
}
