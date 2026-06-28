import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
