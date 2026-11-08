import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessStatus, MembershipRole } from '@prisma/client';
import { BusinessService } from './business.service.js';
import {
  AllowBusinessStatus,
  Authenticated,
  BusinessRoles,
  CurrentUser,
  PlatformAdmin,
} from '../auth/decorators/auth.decorators.js';
import type { AuthUser } from '../auth/auth.types.js';
import {
  CreateBusinessDto,
  ListBusinessesQueryDto,
  UpdateBusinessDto,
  UpdateBusinessStatusDto,
} from './dto/business.dto.js';

@Controller('businesses')
@ApiTags('businesses')
@ApiBearerAuth('access-token')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @Authenticated()
  @ApiOperation({ summary: 'Create a business; the caller becomes its OWNER' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBusinessDto) {
    return this.businessService.create(user.id, dto);
  }

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Businesses I am an active member of' })
  findMine(@CurrentUser() user: AuthUser) {
    return this.businessService.findMine(user.id);
  }

  @Get('admin/list')
  @PlatformAdmin()
  @ApiOperation({ summary: '[Admin] List all businesses with owners and counts' })
  findAllForAdmin(@Query() query: ListBusinessesQueryDto) {
    return this.businessService.findAllForAdmin(query);
  }

  @Get(':businessId')
  @BusinessRoles()
  @AllowBusinessStatus(...Object.values(BusinessStatus))
  @ApiOperation({ summary: 'Get a business I belong to' })
  findOne(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.businessService.findOne(businessId);
  }

  @Patch(':businessId')
  @BusinessRoles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @AllowBusinessStatus(BusinessStatus.ACTIVE, BusinessStatus.PENDING_APPROVAL)
  @ApiOperation({ summary: 'Update business details (OWNER, ADMIN)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.update(user.id, businessId, dto);
  }

  @Delete(':businessId')
  @BusinessRoles(MembershipRole.OWNER)
  @AllowBusinessStatus(BusinessStatus.ACTIVE, BusinessStatus.PENDING_APPROVAL)
  @ApiOperation({ summary: 'Deactivate a business (OWNER)' })
  deactivate(
    @CurrentUser() user: AuthUser,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.businessService.deactivate(user.id, businessId);
  }

  @Patch(':businessId/status')
  @PlatformAdmin()
  @ApiOperation({ summary: '[Admin] Approve, suspend or reactivate a business' })
  setStatus(
    @CurrentUser() user: AuthUser,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: UpdateBusinessStatusDto,
  ) {
    return this.businessService.setStatus(user.id, businessId, dto.status);
  }
}
