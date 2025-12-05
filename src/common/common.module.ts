import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AuditLoggerService } from './audit/audit-logger.service';

@Global()
@Module({
  providers: [HttpExceptionFilter, AuditLoggerService],
  exports: [HttpExceptionFilter, AuditLoggerService],
})
export class CommonModule {}
