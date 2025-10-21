import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@example.com' })
  email: string;
}

export class AccessLogResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ type: UserInfoDto })
  userId: UserInfoDto;

  @ApiProperty({ example: '192.168.1.1' })
  ip: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp: Date;

  constructor(partial: any) {
    this.ip = partial.ip;
    this.timestamp = partial.timestamp;

    if (partial._id) {
      this.id = partial._id.toString();
    }
    if (partial.userId) {
      if (typeof partial.userId === 'object' && partial.userId._id) {
        this.userId = {
          _id: partial.userId._id.toString(),
          name: partial.userId.name,
          email: partial.userId.email,
        };
      } else {
        this.userId = {
          _id: partial.userId.toString(),
          name: 'Unknown',
          email: 'unknown@example.com',
        };
      }
    }
  }
}
