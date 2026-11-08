// Deterministic test configuration. process.env takes precedence over .env
// in @nestjs/config, so tests never depend on a developer's local secrets.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/abuur_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.SUPABASE_URL = 'https://example-project.supabase.co';
process.env.SUPABASE_JWT_SECRET = 'test-supabase-legacy-secret-value';
process.env.CORS_ORIGIN = 'http://localhost:3001';
