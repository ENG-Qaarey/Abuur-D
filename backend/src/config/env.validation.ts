import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT?: number;

  @IsString()
  @MinLength(1)
  DATABASE_URL: string;

  /** Secret for app-issued JWTs. Must be long and random. */
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters' })
  JWT_SECRET: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  SUPABASE_URL: string;

  /** Legacy HS256 Supabase JWT secret. Optional when the project uses asymmetric (JWKS) keys. */
  @IsString()
  @IsOptional()
  SUPABASE_JWT_SECRET?: string;

  /** "false" runs background jobs inline without Redis (local dev only). */
  @IsIn(['true', 'false'])
  @IsOptional()
  REDIS_ENABLED?: string;

  /** Comma-separated list of allowed browser origins. */
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n  ');
    throw new Error(`Invalid environment configuration:\n  ${details}`);
  }
  // Long example strings pass the length check but are public knowledge.
  if (/change-in-production|change-me|your-|secret-key|example/i.test(validated.JWT_SECRET)) {
    throw new Error(
      'JWT_SECRET is an example value. Generate one with: ' +
        `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
    );
  }
  if (
    validated.NODE_ENV === NodeEnv.Production &&
    (!validated.CORS_ORIGIN || validated.CORS_ORIGIN.split(',').map((s) => s.trim()).includes('*'))
  ) {
    throw new Error('CORS_ORIGIN must list explicit origins in production (no "*")');
  }
  return { ...config, ...validated };
}
