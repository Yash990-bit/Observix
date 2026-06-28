import { Module } from '@nestjs/common';
import { LogBatcher } from './log-batcher';
import { ClickHouseModule } from '../clickhouse/clickhouse.module';

@Module({
  imports: [ClickHouseModule],
  providers: [LogBatcher],
  exports: [LogBatcher],
})
export class BatchModule {}
