import { Test, TestingModule } from '@nestjs/testing';
import { DateUtilityService } from './date-utility.service';

describe('DateUtilityService', () => {
  let service: DateUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateUtilityService],
    }).compile();

    service = module.get<DateUtilityService>(DateUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentUTC', () => {
    it('should return current time in ISO 8601 format', () => {
      const result = service.getCurrentUTC();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('parseISO8601ToUTC', () => {
    it('should parse valid ISO 8601 string with Z timezone', () => {
      const isoString = '2026-01-19T10:30:00.000Z';
      const result = service.parseISO8601ToUTC(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(isoString);
    });

    it('should parse valid ISO 8601 string with offset timezone', () => {
      const isoString = '2026-01-19T16:00:00+05:30';
      const result = service.parseISO8601ToUTC(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2026-01-19T10:30:00.000Z');
    });

    it('should reject date without timezone', () => {
      expect(() => {
        service.parseISO8601ToUTC('2026-01-19T10:30:00');
      }).toThrow('Invalid date format');
    });

    it('should reject invalid date string', () => {
      expect(() => {
        service.parseISO8601ToUTC('not-a-date');
      }).toThrow('Invalid date format');
    });

    it('should reject empty string', () => {
      expect(() => {
        service.parseISO8601ToUTC('');
      }).toThrow('Date string is required');
    });

    it('should handle invalid date values like Feb 30', () => {
      // JavaScript Date accepts Feb 30 and rolls it to March 2
      const result = service.parseISO8601ToUTC('2026-02-30T10:30:00Z');
      expect(result.toISOString()).toBe('2026-03-02T10:30:00.000Z');
    });
  });

  describe('toISO8601UTC', () => {
    it('should convert Date to ISO 8601 string', () => {
      const date = new Date('2026-01-19T10:30:00.000Z');
      const result = service.toISO8601UTC(date);
      expect(result).toBe('2026-01-19T10:30:00.000Z');
    });

    it('should reject invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(() => {
        service.toISO8601UTC(invalidDate);
      }).toThrow('Valid Date object is required');
    });
  });

  describe('addDays', () => {
    it('should add days correctly in UTC', () => {
      const date = new Date('2026-01-19T10:30:00.000Z');
      const result = service.addDays(date, 5);
      expect(result.toISOString()).toBe('2026-01-24T10:30:00.000Z');
    });

    it('should subtract days when negative', () => {
      const date = new Date('2026-01-19T10:30:00.000Z');
      const result = service.addDays(date, -5);
      expect(result.toISOString()).toBe('2026-01-14T10:30:00.000Z');
    });

    it('should handle month transitions', () => {
      const date = new Date('2026-01-29T10:30:00.000Z');
      const result = service.addDays(date, 5);
      expect(result.toISOString()).toBe('2026-02-03T10:30:00.000Z');
    });
  });

  describe('addHours', () => {
    it('should add hours correctly in UTC', () => {
      const date = new Date('2026-01-19T10:30:00.000Z');
      const result = service.addHours(date, 3);
      expect(result.toISOString()).toBe('2026-01-19T13:30:00.000Z');
    });

    it('should handle day transitions', () => {
      const date = new Date('2026-01-19T23:00:00.000Z');
      const result = service.addHours(date, 2);
      expect(result.toISOString()).toBe('2026-01-20T01:00:00.000Z');
    });
  });

  describe('getStartOfDayUTC', () => {
    it('should return start of day in UTC', () => {
      const date = new Date('2026-01-19T15:30:45.123Z');
      const result = service.getStartOfDayUTC(date);
      expect(result.toISOString()).toBe('2026-01-19T00:00:00.000Z');
    });
  });

  describe('getEndOfDayUTC', () => {
    it('should return end of day in UTC', () => {
      const date = new Date('2026-01-19T15:30:45.123Z');
      const result = service.getEndOfDayUTC(date);
      expect(result.toISOString()).toBe('2026-01-19T23:59:59.999Z');
    });
  });

  describe('getFirstDayOfMonthUTC', () => {
    it('should return first day of month in UTC', () => {
      const date = new Date('2026-01-19T15:30:45.123Z');
      const result = service.getFirstDayOfMonthUTC(date);
      expect(result.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('getLastDayOfMonthUTC', () => {
    it('should return last day of month in UTC', () => {
      const date = new Date('2026-01-19T15:30:45.123Z');
      const result = service.getLastDayOfMonthUTC(date);
      expect(result.toISOString()).toBe('2026-01-31T23:59:59.999Z');
    });

    it('should handle February correctly', () => {
      const date = new Date('2026-02-15T15:30:45.123Z');
      const result = service.getLastDayOfMonthUTC(date);
      expect(result.toISOString()).toBe('2026-02-28T23:59:59.999Z');
    });

    it('should handle leap year February', () => {
      const date = new Date('2024-02-15T15:30:45.123Z');
      const result = service.getLastDayOfMonthUTC(date);
      expect(result.toISOString()).toBe('2024-02-29T23:59:59.999Z');
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate days difference correctly', () => {
      const date1 = new Date('2026-01-19T10:30:00.000Z');
      const date2 = new Date('2026-01-24T15:30:00.000Z');
      const result = service.getDaysDifference(date1, date2);
      expect(result).toBe(5);
    });

    it('should return negative for past dates', () => {
      const date1 = new Date('2026-01-24T10:30:00.000Z');
      const date2 = new Date('2026-01-19T15:30:00.000Z');
      const result = service.getDaysDifference(date1, date2);
      expect(result).toBe(-5);
    });
  });

  describe('isPast', () => {
    it('should return true for past date', () => {
      const pastDate = new Date('2020-01-19T10:30:00.000Z');
      expect(service.isPast(pastDate)).toBe(true);
    });

    it('should return false for future date', () => {
      const futureDate = new Date('2030-01-19T10:30:00.000Z');
      expect(service.isPast(futureDate)).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should return true for future date', () => {
      const futureDate = new Date('2030-01-19T10:30:00.000Z');
      expect(service.isFuture(futureDate)).toBe(true);
    });

    it('should return false for past date', () => {
      const pastDate = new Date('2020-01-19T10:30:00.000Z');
      expect(service.isFuture(pastDate)).toBe(false);
    });
  });

  describe('isSameDayUTC', () => {
    it('should return true for same day different times', () => {
      const date1 = new Date('2026-01-19T10:30:00.000Z');
      const date2 = new Date('2026-01-19T15:30:00.000Z');
      expect(service.isSameDayUTC(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2026-01-19T23:30:00.000Z');
      const date2 = new Date('2026-01-20T01:30:00.000Z');
      expect(service.isSameDayUTC(date1, date2)).toBe(false);
    });
  });

  describe('isValidISO8601WithTimezone', () => {
    it('should validate correct ISO 8601 with Z', () => {
      expect(service.isValidISO8601WithTimezone('2026-01-19T10:30:00Z')).toBe(true);
      expect(service.isValidISO8601WithTimezone('2026-01-19T10:30:00.000Z')).toBe(true);
    });

    it('should validate correct ISO 8601 with offset', () => {
      expect(service.isValidISO8601WithTimezone('2026-01-19T10:30:00+05:30')).toBe(true);
      expect(service.isValidISO8601WithTimezone('2026-01-19T10:30:00-08:00')).toBe(true);
    });

    it('should reject ISO 8601 without timezone', () => {
      expect(service.isValidISO8601WithTimezone('2026-01-19T10:30:00')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(service.isValidISO8601WithTimezone('2026-01-19')).toBe(false);
      expect(service.isValidISO8601WithTimezone('not-a-date')).toBe(false);
      expect(service.isValidISO8601WithTimezone('')).toBe(false);
    });
  });

  describe('getUnixTimestamp', () => {
    it('should return Unix timestamp', () => {
      const date = new Date('2026-01-19T10:30:00.000Z');
      const result = service.getUnixTimestamp(date);
      expect(result).toBe(1768818600000);
    });

    it('should return current timestamp when no date provided', () => {
      const before = Date.now();
      const result = service.getUnixTimestamp();
      const after = Date.now();
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });

  describe('fromUnixTimestamp', () => {
    it('should create Date from Unix timestamp', () => {
      const timestamp = 1768818600000;
      const result = service.fromUnixTimestamp(timestamp);
      expect(result.toISOString()).toBe('2026-01-19T10:30:00.000Z');
    });
  });
});
