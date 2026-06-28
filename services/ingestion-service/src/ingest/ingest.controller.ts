import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IngestLogDto } from './log.dto';
import { IngestService } from './ingest.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';

@Controller('logs')
@UseGuards(ApiKeyGuard, RateLimiterGuard)
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingest(@Body() dto: IngestLogDto) {
    return this.ingestService.processLog(dto);
  }
}
