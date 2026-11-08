import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { ContactStatus, ContactTopic } from '@prisma/client';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Hodan Ali' })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional({ example: 'hodan@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: '+252 61 0000000' })
  @IsOptional()
  @Matches(/^\+?[0-9 ()-]{6,30}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Hodan Fashion' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessName?: string;

  @ApiProperty({ enum: ContactTopic, default: ContactTopic.SALES })
  @IsEnum(ContactTopic)
  topic: ContactTopic;

  @ApiProperty({ example: 'I want to open a store for my shop in Hargeisa.' })
  @IsString()
  @Length(10, 2000)
  message: string;

  @ApiPropertyOptional({ enum: ['so', 'en'] })
  @IsOptional()
  @IsIn(['so', 'en'])
  locale?: string;

  /** Honeypot: hidden in the form. Real people leave it empty. */
  @ApiPropertyOptional({ description: 'Leave empty' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  status: ContactStatus;
}
