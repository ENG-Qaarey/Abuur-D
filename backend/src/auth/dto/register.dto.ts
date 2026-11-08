import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Hodan' })
  @IsString()
  @Length(1, 80)
  firstName: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  @Length(1, 80)
  lastName: string;

  @ApiProperty({ example: 'hodan@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'a-strong-password', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password: string;
}
