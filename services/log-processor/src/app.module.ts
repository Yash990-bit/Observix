import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ClickHouseModule } from './clickhouse/clickhouse.module';
import { BatchModule } from './batch/batch.module';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
  imports: [ConfigModule, ClickHouseModule, BatchModule, ConsumerModule],
})
export class AppModule {}
