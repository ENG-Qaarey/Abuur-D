import { Body, Controller, Get, Headers, HttpCode, Ip, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContactStatus } from '@prisma/client';
import { CurrentUser, PlatformAdmin, Public } from '../auth/decorators/auth.decorators.js';
import type { AuthUser } from '../auth/auth.types.js';
import { ContactMessageService } from './contact-message.service.js';
import { CreateContactMessageDto, UpdateContactStatusDto } from './dto/contact-message.dto.js';

@Controller('contact-messages')
@ApiTags('contact messages')
export class ContactMessageController {
  constructor(private readonly messages: ContactMessageService) {}

  @Post()
  @HttpCode(201)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Website contact form (public)' })
  submit(@Body() dto: CreateContactMessageDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.messages.submit(dto, { ip, userAgent });
  }

  @Get()
  @PlatformAdmin()
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'status', enum: ContactStatus, required: false })
  @ApiOperation({ summary: '[Admin] List website messages' })
  list(@Query('status', new ParseEnumPipe(ContactStatus, { optional: true })) status?: ContactStatus) {
    return this.messages.list(status);
  }

  @Patch(':id')
  @PlatformAdmin()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Mark a message handled / archived / new' })
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messages.setStatus(id, dto.status, user.id);
  }
}
