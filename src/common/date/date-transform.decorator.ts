import { Transform } from 'class-transformer';
import { DateUtilityService } from './date-utility.service';

const dateUtilityService = new DateUtilityService();

/**
 * Transform decorator to convert ISO 8601 date strings to Date objects
 * Use this in DTOs to automatically parse incoming date strings
 * 
 * @example
 * ```typescript
 * class CreateEventDto {
 *   @IsISO8601WithTimezone()
 *   @TransformToDate()
 *   startDate: Date;
 * }
 * ```
 */
export function TransformToDate() {
  return Transform(({ value }) => {
    if (!value) {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        return dateUtilityService.parseISO8601ToUTC(value);
      } catch (error) {
        // Return the original value to let validators handle the error
        return value;
      }
    }

    return value;
  });
}

/**
 * Transform decorator to convert Date objects to ISO 8601 strings
 * Use this for response DTOs to ensure consistent date formatting
 * 
 * @example
 * ```typescript
 * class EventResponseDto {
 *   @TransformToISO8601()
 *   createdAt: string;
 * }
 * ```
 */
export function TransformToISO8601() {
  return Transform(({ value }) => {
    if (!value) {
      return value;
    }

    if (value instanceof Date) {
      return dateUtilityService.toISO8601UTC(value);
    }

    return value;
  });
}
