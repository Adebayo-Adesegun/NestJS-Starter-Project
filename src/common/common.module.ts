import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AuditLoggerService } from './audit/audit-logger.service';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';

@Global()
@Module({
  providers: [HttpExceptionFilter, AuditLoggerService, RateLimiterService],
  exports: [HttpExceptionFilter, AuditLoggerService, RateLimiterService],
})
export class CommonModule {}
