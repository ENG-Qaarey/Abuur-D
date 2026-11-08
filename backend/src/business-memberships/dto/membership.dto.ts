import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { MembershipRole } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ description: 'Email of an existing ABUUR user' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: MembershipRole, example: MembershipRole.EMPLOYEE })
  @IsEnum(MembershipRole)
  role: MembershipRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: MembershipRole })
  @IsEnum(MembershipRole)
  role: MembershipRole;
}
