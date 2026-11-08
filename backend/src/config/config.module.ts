import { ConfigModule } from '@nestjs/config';
import configuration from './configuration.js';
import { validateEnv } from './env.validation.js';

export const Config = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  envFilePath: ['.env'],
  validate: validateEnv,
});
