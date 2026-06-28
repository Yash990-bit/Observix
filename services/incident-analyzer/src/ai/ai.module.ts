import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiSreService } from './ai-sre.service';

@Module({
  imports: [ConfigModule],
  providers: [AiSreService],
  exports: [AiSreService],
})
export class AiModule {}
