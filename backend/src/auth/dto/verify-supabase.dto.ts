import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class VerifySupabaseDto {
  @ApiProperty({ description: 'Supabase session access token' })
  @IsJWT()
  accessToken: string;
}
