import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  /** Express trust proxy setting, e.g. 'loopback' or '10.0.0.0/8'. */
  trustProxy: process.env.TRUST_PROXY || 'loopback',
  // Validated in env.validation.ts; no insecure fallback.
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  jwtIssuer: 'abuur-backend',
  jwtAudience: 'abuur-api',
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  observeAppKey: process.env.OBSERVE_APP_KEY ?? '',
  observeAppSecret: process.env.OBSERVE_APP_SECRET ?? '',
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    enabled: process.env.REDIS_ENABLED?.trim().toLowerCase() !== 'false',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    from: process.env.RESEND_FROM ?? 'noreply@yourdomain.com',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
  },
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL ?? 'https://graph.facebook.com/v18.0',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  },
  sms: {
    apiKey: process.env.SMS_API_KEY ?? '',
    apiUrl: process.env.SMS_API_URL ?? 'https://api.sms-provider.com/v1',
  },
}));
