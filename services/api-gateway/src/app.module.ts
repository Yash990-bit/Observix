import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { StreamModule } from './stream/stream.module';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [ConfigModule, HealthModule, StreamModule, ProxyModule],
})
export class AppModule {}
