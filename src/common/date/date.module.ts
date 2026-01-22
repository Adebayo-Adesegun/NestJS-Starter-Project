import { Module, Global } from '@nestjs/common';
import { DateUtilityService } from './date-utility.service';

/**
 * DateModule - Provides date handling utilities globally
 * 
 * This module is marked as @Global() so DateUtilityService
 * is available throughout the application without explicit imports
 */
@Global()
@Module({
  providers: [DateUtilityService],
  exports: [DateUtilityService],
})
export class DateModule {}
