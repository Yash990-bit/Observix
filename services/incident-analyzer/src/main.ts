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

  app.enableShutdownHooks();
  app.enableCors();

  // Register global validation pipe to validate incoming DTO payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('ANALYZER_PORT') || 3008;

  await app.listen(port);
  logger.log(`Incident Analyzer service started on port ${port}`, 'Bootstrap');
}
bootstrap();
