import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BusinessStatus,
  MembershipRole,
  type BusinessMembership,
} from '@prisma/client';
import { BusinessMembershipService } from './business-membership.service.js';
import {
  AllowBusinessStatus,
  BusinessRoles,
  CurrentMembership,
  CurrentUser,
} from '../auth/decorators/auth.decorators.js';
import type { AuthUser } from '../auth/auth.types.js';
import { InviteMemberDto, UpdateMemberRoleDto } from './dto/membership.dto.js';

const actorOf = BusinessMembershipService.actorFrom;

const SETUP_STATUSES = [BusinessStatus.ACTIVE, BusinessStatus.PENDING_APPROVAL];

@Controller('businesses/:businessId/members')
@ApiTags('business members')
@ApiBearerAuth('access-token')
export class BusinessMembershipController {
  constructor(private readonly memberships: BusinessMembershipService) {}

  @Get()
  @BusinessRoles()
  @AllowBusinessStatus(...SETUP_STATUSES)
  @ApiOperation({ summary: 'List members and pending invitations' })
  list(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.memberships.list(businessId);
  }

  @Post()
  @BusinessRoles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @AllowBusinessStatus(...SETUP_STATUSES)
  @ApiOperation({ summary: 'Invite an existing user (OWNER, ADMIN)' })
  invite(
    @CurrentUser() user: AuthUser,
    @CurrentMembership() membership: BusinessMembership | null,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.memberships.invite(actorOf(user.id, membership), businessId, dto);
  }

  @Patch(':memberId')
  @BusinessRoles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @AllowBusinessStatus(...SETUP_STATUSES)
  @ApiOperation({ summary: "Change a member's role (OWNER, ADMIN)" })
  changeRole(
    @CurrentUser() user: AuthUser,
    @CurrentMembership() membership: BusinessMembership | null,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.memberships.changeRole(
      actorOf(user.id, membership),
      businessId,
      memberId,
      dto.role,
    );
  }

  @Delete(':memberId')
  @HttpCode(204)
  @BusinessRoles()
  // Leaving must work even when the business is suspended or inactive.
  @AllowBusinessStatus(...Object.values(BusinessStatus))
  @ApiOperation({ summary: 'Remove a member, or leave the business yourself' })
  async remove(
    @CurrentUser() user: AuthUser,
    @CurrentMembership() membership: BusinessMembership | null,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    await this.memberships.remove(actorOf(user.id, membership), businessId, memberId);
  }
}
