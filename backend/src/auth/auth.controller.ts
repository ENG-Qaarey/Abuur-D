import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import {
  Authenticated,
  CurrentUser,
  Public,
} from './decorators/auth.decorators.js';
import { VerifySupabaseDto } from './dto/verify-supabase.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserService } from '../users/user.service.js';
import type { AuthUser } from './auth.types.js';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('verify-supabase')
  @HttpCode(200)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Exchange a Supabase access token for an app access token' })
  verifySupabase(@Body() body: VerifySupabaseDto) {
    return this.authService.loginWithSupabase(body.accessToken);
  }

  @Post('login')
  @HttpCode(200)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Log in with email + password (local accounts, e.g. the seeded admin)' })
  login(@Body() body: LoginDto) {
    return this.authService.loginWithPassword(body.email, body.password);
  }

  @Post('register')
  @HttpCode(201)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create a local email + password account and log in' })
  register(@Body() body: RegisterDto) {
    return this.authService.registerWithPassword(body);
  }

  @Get('me')
  @Authenticated()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Current user with their business memberships' })
  me(@CurrentUser() user: AuthUser) {
    return this.userService.getProfile(user.id);
  }
}
