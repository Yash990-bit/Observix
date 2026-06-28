import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { IngestModule } from './ingest/ingest.module';

@Module({
  imports: [ConfigModule, IngestModule],
})
export class AppModule {}
