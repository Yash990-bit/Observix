import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
  ],
})
export class ConfigModule {}
