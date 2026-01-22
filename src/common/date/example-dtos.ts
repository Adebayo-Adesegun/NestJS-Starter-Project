import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsISO8601WithTimezone,
  IsAfterDate,
  IsNotPastDate,
} from '../../common/date/date-validators.decorator';
import { TransformToDate } from '../../common/date/date-transform.decorator';

/**
 * Example DTO demonstrating proper date handling
 * 
 * Key points:
 * 1. Use @IsISO8601WithTimezone() to require timezone info
 * 2. Use @TransformToDate() to convert string to Date object
 * 3. Use @IsAfterDate() to validate date ranges
 * 4. Use @IsNotPastDate() to prevent past dates
 * 5. Document expected format in API documentation
 */
export class CreateEventDto {
  @ApiProperty({
    description: 'Event name',
    example: 'Annual Conference',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Our annual technology conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Event start date and time in ISO 8601 format with timezone',
    example: '2026-03-15T09:00:00Z',
    type: String,
  })
  @IsISO8601WithTimezone()
  @IsNotPastDate()
  @TransformToDate()
  startDate: Date;

  @ApiProperty({
    description: 'Event end date and time in ISO 8601 format with timezone',
    example: '2026-03-15T17:00:00Z',
    type: String,
  })
  @IsISO8601WithTimezone()
  @IsAfterDate('startDate', {
    message: 'End date must be after start date',
  })
  @TransformToDate()
  endDate: Date;

  @ApiProperty({
    description: 'Registration deadline in ISO 8601 format with timezone',
    example: '2026-03-10T23:59:59Z',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsISO8601WithTimezone()
  @TransformToDate()
  registrationDeadline?: Date;
}

/**
 * Example response DTO
 * Date fields will be automatically transformed to ISO 8601 strings
 * by the global DateTransformInterceptor
 */
export class EventResponseDto {
  @ApiProperty({
    description: 'Event ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Event name',
    example: 'Annual Conference',
  })
  name: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Our annual technology conference',
  })
  description: string;

  @ApiProperty({
    description: 'Event start date and time (ISO 8601 UTC)',
    example: '2026-03-15T09:00:00.000Z',
    type: String,
  })
  startDate: Date;

  @ApiProperty({
    description: 'Event end date and time (ISO 8601 UTC)',
    example: '2026-03-15T17:00:00.000Z',
    type: String,
  })
  endDate: Date;

  @ApiProperty({
    description: 'Registration deadline (ISO 8601 UTC)',
    example: '2026-03-10T23:59:59.000Z',
    type: String,
    required: false,
  })
  registrationDeadline?: Date;

  @ApiProperty({
    description: 'Record creation timestamp (ISO 8601 UTC)',
    example: '2026-01-19T10:30:00.000Z',
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp (ISO 8601 UTC)',
    example: '2026-01-19T15:45:00.000Z',
    type: String,
  })
  updatedAt: Date;
}

/**
 * Example DTO for filtering by date range
 */
export class DateRangeFilterDto {
  @ApiProperty({
    description: 'Filter start date in ISO 8601 format with timezone',
    example: '2026-01-01T00:00:00Z',
    type: String,
  })
  @IsISO8601WithTimezone()
  @TransformToDate()
  startDate: Date;

  @ApiProperty({
    description: 'Filter end date in ISO 8601 format with timezone',
    example: '2026-12-31T23:59:59Z',
    type: String,
  })
  @IsISO8601WithTimezone()
  @IsAfterDate('startDate')
  @TransformToDate()
  endDate: Date;
}
