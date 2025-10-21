import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string = 'Bearer';

  @ApiProperty({ example: 86400 })
  expires_in: number;

  constructor(accessToken: string, expiresIn: number) {
    this.access_token = accessToken;
    this.expires_in = expiresIn;
  }
}
