import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const isProduction = config.get<string>('app.nodeEnv') === 'production';
  const port = config.get<number>('app.port') ?? 3000;

  // Rate limits key on the client IP. Only trust X-Forwarded-For from known
  // proxies (default: localhost, i.e. the Next.js server on this machine),
  // otherwise anyone could fake their IP. Set TRUST_PROXY for your host.
  app.getHttpAdapter().getInstance().set('trust proxy', config.get<string>('app.trustProxy') ?? 'loopback');

  app.use(helmet());
  app.use(compression());
  app.enableShutdownHooks();

  // CORS: explicit allowlist. "*" is only honoured outside production
  // (env validation rejects it in production) and then without credentials.
  const origins = config.get<string[]>('app.corsOrigins') ?? [];
  const allowAny = origins.includes('*');
  app.enableCors({
    origin: allowAny ? true : origins,
    credentials: !allowAny,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Business-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.setGlobalPrefix('api');

  if (!isProduction) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('ABUUR Backend API')
        .setDescription(
          'Multi-tenant business management platform with CRM, creative production, e-commerce, finance, and marketing.',
        )
        .setVersion('1.0.0')
        .addBearerAuth(
          { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          'access-token',
        )
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
      customCss: '.swagger-ui .topbar { background-color: #0a192f }',
      customSiteTitle: 'ABUUR API Docs',
    });
  }

  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  if (!isProduction) logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
