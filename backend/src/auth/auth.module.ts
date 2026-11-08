import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { BusinessAccessGuard } from './guards/business-access.guard.js';
import { UserModule } from '../users/user.module.js';

/**
 * The guards are registered as APP_GUARDs in AppModule so their order is explicit:
 * ThrottlerGuard -> JwtAuthGuard -> BusinessAccessGuard.
 */
@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('app.jwtSecret'),
        signOptions: {
          algorithm: 'HS256',
          // e.g. '1h', '15m' (validated by jsonwebtoken at sign time)
          expiresIn: (config.get<string>('app.jwtExpiresIn') ?? '1h') as `${number}h`,
          issuer: config.get<string>('app.jwtIssuer'),
          audience: config.get<string>('app.jwtAudience'),
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, BusinessAccessGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, BusinessAccessGuard],
})
export class AuthModule {}
