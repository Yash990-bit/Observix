import { Module } from '@nestjs/common';
import { NatsConsumerService } from './nats-consumer.service';
import { BatchModule } from '../batch/batch.module';

@Module({
  imports: [BatchModule],
  providers: [NatsConsumerService],
  exports: [NatsConsumerService],
})
export class ConsumerModule {}
