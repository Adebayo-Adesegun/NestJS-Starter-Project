import { Injectable } from '@nestjs/common';

/**
 * DateUtilityService - Core date handling service
 * 
 * Principles:
 * 1. All internal operations use UTC
 * 2. Timezone conversions only at boundaries (input/output)
 * 3. ISO 8601 format for all date strings
 * 4. Explicit timezone handling (no implicit local times)
 */
@Injectable()
export class DateUtilityService {
  /**
   * Get current UTC timestamp in ISO 8601 format
   * @returns ISO 8601 string in UTC (e.g., "2026-01-19T10:30:00.000Z")
   */
  getCurrentUTC(): string {
    return new Date().toISOString();
  }

  /**
   * Get current UTC date object
   * @returns Date object representing current UTC time
   */
  getCurrentUTCDate(): Date {
    return new Date();
  }

  /**
   * Parse ISO 8601 string to UTC Date object
   * Validates format and ensures timezone information is present
   * 
   * @param isoString - ISO 8601 formatted date string with timezone
   * @returns Date object in UTC
   * @throws Error if string is invalid or lacks timezone information
   */
  parseISO8601ToUTC(isoString: string): Date {
    if (!isoString) {
      throw new Error('Date string is required');
    }

    // Validate ISO 8601 format with timezone
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
    
    if (!iso8601Regex.test(isoString)) {
      throw new Error(
        'Invalid date format. Expected ISO 8601 with timezone (e.g., 2026-01-19T10:30:00Z or 2026-01-19T10:30:00+05:30)'
      );
    }

    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date value');
    }

    return date;
  }

  /**
   * Convert Date object to ISO 8601 UTC string
   * @param date - Date object to convert
   * @returns ISO 8601 string in UTC
   */
  toISO8601UTC(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Valid Date object is required');
    }

    return date.toISOString();
  }

  /**
   * Add days to a date (UTC-safe)
   * @param date - Base date
   * @param days - Number of days to add (can be negative)
   * @returns New Date object
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  /**
   * Add hours to a date (UTC-safe)
   * @param date - Base date
   * @param hours - Number of hours to add (can be negative)
   * @returns New Date object
   */
  addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setUTCHours(result.getUTCHours() + hours);
    return result;
  }

  /**
   * Add minutes to a date (UTC-safe)
   * @param date - Base date
   * @param minutes - Number of minutes to add (can be negative)
   * @returns New Date object
   */
  addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setUTCMinutes(result.getUTCMinutes() + minutes);
    return result;
  }

  /**
   * Get start of day in UTC
   * @param date - Date to get start of day for
   * @returns Date object set to 00:00:00.000 UTC
   */
  getStartOfDayUTC(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day in UTC
   * @param date - Date to get end of day for
   * @returns Date object set to 23:59:59.999 UTC
   */
  getEndOfDayUTC(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get first day of month in UTC
   * @param date - Date to get first day for
   * @returns Date object set to first day of month at 00:00:00.000 UTC
   */
  getFirstDayOfMonthUTC(date: Date): Date {
    const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    return result;
  }

  /**
   * Get last day of month in UTC
   * @param date - Date to get last day for
   * @returns Date object set to last day of month at 23:59:59.999 UTC
   */
  getLastDayOfMonthUTC(date: Date): Date {
    const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return result;
  }

  /**
   * Calculate difference between two dates in days
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Number of days between dates (can be negative)
   */
  getDaysDifference(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
    const utc2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
    return Math.floor((utc2 - utc1) / msPerDay);
  }

  /**
   * Check if a date is in the past (UTC)
   * @param date - Date to check
   * @returns true if date is before current UTC time
   */
  isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * Check if a date is in the future (UTC)
   * @param date - Date to check
   * @returns true if date is after current UTC time
   */
  isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * Compare two dates (ignoring time component)
   * @param date1 - First date
   * @param date2 - Second date
   * @returns true if same day in UTC
   */
  isSameDayUTC(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  /**
   * Validate if a string is valid ISO 8601 with timezone
   * @param isoString - String to validate
   * @returns true if valid ISO 8601 with timezone
   */
  isValidISO8601WithTimezone(isoString: string): boolean {
    if (!isoString) return false;
    
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
    
    if (!iso8601Regex.test(isoString)) {
      return false;
    }

    const date = new Date(isoString);
    return !isNaN(date.getTime());
  }

  /**
   * Format date for database storage (ISO 8601 UTC)
   * This ensures consistent storage format across the application
   * 
   * @param date - Date to format
   * @returns ISO 8601 string in UTC
   */
  formatForDatabase(date: Date): string {
    return this.toISO8601UTC(date);
  }

  /**
   * Get Unix timestamp (milliseconds since epoch)
   * @param date - Date to convert (defaults to now)
   * @returns Unix timestamp in milliseconds
   */
  getUnixTimestamp(date: Date = new Date()): number {
    return date.getTime();
  }

  /**
   * Create Date from Unix timestamp
   * @param timestamp - Unix timestamp in milliseconds
   * @returns Date object
   */
  fromUnixTimestamp(timestamp: number): Date {
    return new Date(timestamp);
  }
}
