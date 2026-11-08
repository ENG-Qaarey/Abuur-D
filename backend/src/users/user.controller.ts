import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service.js';
import {
  Authenticated,
  CurrentUser,
  PlatformAdmin,
} from '../auth/decorators/auth.decorators.js';
import type { AuthUser } from '../auth/auth.types.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Authenticated()
  @ApiOperation({ summary: 'My profile and memberships' })
  getMe(@CurrentUser() user: AuthUser) {
    return this.userService.getProfile(user.id);
  }

  @Patch('me')
  @Authenticated()
  @ApiOperation({ summary: 'Update my profile' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Post('me/memberships/:membershipId/accept')
  @HttpCode(200)
  @Authenticated()
  @ApiOperation({ summary: 'Accept an invitation to join a business' })
  acceptInvitation(
    @CurrentUser() user: AuthUser,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.userService.acceptInvitation(user.id, membershipId);
  }

  // ---- Platform admin ----

  @Get()
  @PlatformAdmin()
  @ApiOperation({ summary: '[Admin] List users' })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    if (skip < 0 || take < 1) {
      throw new BadRequestException('skip must be >= 0 and take must be >= 1');
    }
    return this.userService.findAll({ skip, take });
  }

  @Get(':id')
  @PlatformAdmin()
  @ApiOperation({ summary: '[Admin] Get a user' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id/status')
  @PlatformAdmin()
  @ApiOperation({ summary: '[Admin] Activate or suspend a user' })
  setStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.setStatus(actor.id, id, dto.status);
  }
}
