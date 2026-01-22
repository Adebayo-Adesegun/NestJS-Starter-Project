# Date Handling Module

A comprehensive UTC-first date handling system for NestJS applications.

## Quick Start

### Installation

The module is already integrated into your application. Import utilities as needed:

```typescript
import {
  DateUtilityService,
  IsISO8601WithTimezone,
  TransformToDate,
  IsAfterDate,
  IsNotPastDate,
} from './common/date';
```

### Basic Usage

#### In DTOs

```typescript
import { IsISO8601WithTimezone, TransformToDate } from './common/date';

export class CreateEventDto {
  @IsISO8601WithTimezone()
  @TransformToDate()
  startDate: Date;

  @IsISO8601WithTimezone()
  @IsAfterDate('startDate')
  @TransformToDate()
  endDate: Date;
}
```

#### In Services

```typescript
@Injectable()
export class EventsService {
  constructor(private readonly dateUtility: DateUtilityService) {}

  createEvent(dto: CreateEventDto) {
    const now = this.dateUtility.getCurrentUTCDate();
    const futureDate = this.dateUtility.addDays(dto.startDate, 7);
    const startOfDay = this.dateUtility.getStartOfDayUTC(dto.startDate);
    
    // All operations are UTC-safe
    return this.eventsRepo.save({
      ...dto,
      createdAt: now,
      reminderDate: futureDate,
    });
  }
}
```

## Features

### ✅ UTC-First Design
- All internal operations in UTC
- Timezone conversions only at boundaries
- Automatic DST handling

### ✅ Strict Validation
- Requires ISO 8601 format with timezone
- Rejects ambiguous date strings
- Custom validators for date ranges

### ✅ Type Safety
- Strong TypeScript types
- Automatic transformations
- Compile-time checks

### ✅ Database Integration
- PostgreSQL configured for UTC
- `timestamp with time zone` columns
- Automatic timezone handling by TypeORM

## API Reference

### DateUtilityService

| Method | Description |
|--------|-------------|
| `getCurrentUTC()` | Get current time as ISO 8601 string |
| `getCurrentUTCDate()` | Get current time as Date object |
| `parseISO8601ToUTC(string)` | Parse ISO 8601 string to Date |
| `toISO8601UTC(date)` | Convert Date to ISO 8601 string |
| `addDays(date, days)` | Add/subtract days (UTC-safe) |
| `addHours(date, hours)` | Add/subtract hours (UTC-safe) |
| `addMinutes(date, minutes)` | Add/subtract minutes (UTC-safe) |
| `getStartOfDayUTC(date)` | Get 00:00:00.000 UTC |
| `getEndOfDayUTC(date)` | Get 23:59:59.999 UTC |
| `getFirstDayOfMonthUTC(date)` | Get first day of month |
| `getLastDayOfMonthUTC(date)` | Get last day of month |
| `getDaysDifference(date1, date2)` | Calculate days between dates |
| `isPast(date)` | Check if date is in the past |
| `isFuture(date)` | Check if date is in the future |
| `isSameDayUTC(date1, date2)` | Compare dates (ignore time) |

### Validators

| Decorator | Description |
|-----------|-------------|
| `@IsISO8601WithTimezone()` | Requires ISO 8601 with timezone |
| `@IsAfterDate(property)` | Validates date is after another |
| `@IsNotPastDate()` | Rejects past dates |

### Transformers

| Decorator | Description |
|-----------|-------------|
| `@TransformToDate()` | Converts string to Date in DTOs |
| `@TransformToISO8601()` | Converts Date to string (rarely needed) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│  Sends: "2026-01-19T10:30:00+05:30" (with timezone)   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Validation & Transform                   │
│  @IsISO8601WithTimezone() + @TransformToDate()         │
│  Converts to: Date object in UTC                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic                         │
│  All operations in UTC using DateUtilityService         │
│  No timezone conversions, DST handled automatically     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│  PostgreSQL with timezone='UTC'                         │
│  timestamp with time zone columns                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Response Transform                       │
│  DateTransformInterceptor (global)                      │
│  Converts Date objects to ISO 8601 UTC strings         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│  Receives: "2026-01-19T05:00:00.000Z" (UTC)            │
│  Displays in user's local timezone                      │
└─────────────────────────────────────────────────────────┘
```

## Testing

All date handling is thoroughly tested:

```bash
npm test -- src/common/date/date-utility.service.spec.ts
```

## Documentation

See [DATE_HANDLING.md](../../DATE_HANDLING.md) for comprehensive documentation including:
- Design principles
- Best practices
- Migration guide
- Common pitfalls
- Client integration

## Examples

See [example-dtos.ts](./example-dtos.ts) for complete examples of:
- Input DTOs with validation
- Response DTOs
- Date range filters
- Swagger documentation

## Files

```
src/common/date/
├── README.md                        # This file
├── date-utility.service.ts          # Core date operations
├── date-utility.service.spec.ts     # Comprehensive tests
├── date.module.ts                   # Module definition
├── date-validators.decorator.ts     # Custom validators
├── date-transform.decorator.ts      # DTO transformers
├── date-transform.interceptor.ts    # Response interceptor
├── example-dtos.ts                  # Usage examples
└── index.ts                         # Public exports
```

## License

Part of NestJS Starter Template
