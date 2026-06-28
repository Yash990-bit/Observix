import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from '@aegisai/shared';

async function bootstrap() {
  const logger = new StructuredLogger();
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger,
  });

  // Handle process termination cleanly by closing active database/broker connections
  app.enableShutdownHooks();

  logger.log('Log Processor Service successfully started as an offline background worker.', 'Bootstrap');
}
bootstrap();
