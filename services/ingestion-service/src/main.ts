import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredLogger } from '@aegisai/shared';

async function bootstrap() {
  const logger = new StructuredLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Global validation pipe for incoming request body validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3006;

  await app.listen(port, '0.0.0.0');
  logger.log(`Ingestion service started on port ${port} (0.0.0.0)`, 'Bootstrap');
}
bootstrap();
