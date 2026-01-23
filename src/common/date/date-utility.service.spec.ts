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

  describe('Timezone and DST Handling', () => {
    describe('Daylight Saving Time (DST) Transitions', () => {
      it('should handle DST spring forward in US (2:00 AM -> 3:00 AM)', () => {
        // In 2024, DST starts on March 10, 2 AM local time
        // When a user in EST (UTC-5) sends 2024-03-10T01:00:00-05:00
        // And another sends 2024-03-10T03:00:00-04:00 (after DST)
        const beforeDST = service.parseISO8601ToUTC('2024-03-10T01:00:00-05:00');
        const afterDST = service.parseISO8601ToUTC('2024-03-10T03:00:00-04:00');
        
        // Both should be converted to UTC correctly
        expect(beforeDST.toISOString()).toBe('2024-03-10T06:00:00.000Z');
        expect(afterDST.toISOString()).toBe('2024-03-10T07:00:00.000Z');
        
        // Difference should be 1 hour
        const diffHours = (afterDST.getTime() - beforeDST.getTime()) / (1000 * 60 * 60);
        expect(diffHours).toBe(1);
      });

      it('should handle DST fall back in US (2:00 AM -> 1:00 AM)', () => {
        // In 2024, DST ends on November 3, 2 AM local time
        // When clocks fall back from EDT (UTC-4) to EST (UTC-5)
        const beforeFallBack = service.parseISO8601ToUTC('2024-11-03T01:00:00-04:00');
        const afterFallBack = service.parseISO8601ToUTC('2024-11-03T01:00:00-05:00');
        
        expect(beforeFallBack.toISOString()).toBe('2024-11-03T05:00:00.000Z');
        expect(afterFallBack.toISOString()).toBe('2024-11-03T06:00:00.000Z');
        
        // These represent different UTC times even though local time is same
        expect(afterFallBack.getTime()).toBeGreaterThan(beforeFallBack.getTime());
      });

      it('should handle DST in Europe (UK GMT/BST)', () => {
        // BST starts last Sunday of March (clocks forward 1 hour)
        // In 2024: March 31, 1 AM -> 2 AM
        const beforeBST = service.parseISO8601ToUTC('2024-03-31T00:30:00+00:00');
        const afterBST = service.parseISO8601ToUTC('2024-03-31T02:30:00+01:00');
        
        expect(beforeBST.toISOString()).toBe('2024-03-31T00:30:00.000Z');
        expect(afterBST.toISOString()).toBe('2024-03-31T01:30:00.000Z');
        
        const diffHours = (afterBST.getTime() - beforeBST.getTime()) / (1000 * 60 * 60);
        expect(diffHours).toBe(1);
      });

      it('should handle DST in Australia (opposite to Northern Hemisphere)', () => {
        // Australia DST ends first Sunday of April
        // In 2024: April 7, 3 AM -> 2 AM (clocks back)
        const beforeDSTEnd = service.parseISO8601ToUTC('2024-04-07T01:00:00+11:00');
        const afterDSTEnd = service.parseISO8601ToUTC('2024-04-07T03:00:00+10:00');
        
        expect(beforeDSTEnd.toISOString()).toBe('2024-04-06T14:00:00.000Z');
        expect(afterDSTEnd.toISOString()).toBe('2024-04-06T17:00:00.000Z');
      });
    });

    describe('Multi-country timezone scenarios', () => {
      it('should correctly handle same moment in different timezones', () => {
        // New Year 2024 at midnight in different timezones
        const tokyo = service.parseISO8601ToUTC('2024-01-01T00:00:00+09:00'); // JST
        const london = service.parseISO8601ToUTC('2023-12-31T15:00:00+00:00'); // GMT
        const newYork = service.parseISO8601ToUTC('2023-12-31T10:00:00-05:00'); // EST
        const losAngeles = service.parseISO8601ToUTC('2023-12-31T07:00:00-08:00'); // PST
        
        // All should represent the exact same moment in UTC
        expect(tokyo.toISOString()).toBe('2023-12-31T15:00:00.000Z');
        expect(london.toISOString()).toBe('2023-12-31T15:00:00.000Z');
        expect(newYork.toISOString()).toBe('2023-12-31T15:00:00.000Z');
        expect(losAngeles.toISOString()).toBe('2023-12-31T15:00:00.000Z');
        
        // All times should be equal
        expect(tokyo.getTime()).toBe(london.getTime());
        expect(london.getTime()).toBe(newYork.getTime());
        expect(newYork.getTime()).toBe(losAngeles.getTime());
      });

      it('should handle India Standard Time (UTC+5:30 - half hour offset)', () => {
        const istTime = service.parseISO8601ToUTC('2024-01-19T16:00:00+05:30');
        expect(istTime.toISOString()).toBe('2024-01-19T10:30:00.000Z');
      });

      it('should handle Nepal Time (UTC+5:45 - 45 minute offset)', () => {
        const nepaliTime = service.parseISO8601ToUTC('2024-01-19T16:15:00+05:45');
        expect(nepaliTime.toISOString()).toBe('2024-01-19T10:30:00.000Z');
      });

      it('should handle negative UTC offsets', () => {
        const eastCoastUS = service.parseISO8601ToUTC('2024-01-19T05:30:00-05:00');
        const westCoastUS = service.parseISO8601ToUTC('2024-01-19T02:30:00-08:00');
        
        expect(eastCoastUS.toISOString()).toBe('2024-01-19T10:30:00.000Z');
        expect(westCoastUS.toISOString()).toBe('2024-01-19T10:30:00.000Z');
      });

      it('should handle timezone at international date line', () => {
        // Samoa (UTC-11) and New Zealand (UTC+13) can be 24 hours apart
        const samoa = service.parseISO8601ToUTC('2024-01-19T23:30:00-11:00');
        const newZealand = service.parseISO8601ToUTC('2024-01-20T23:30:00+13:00');
        
        expect(samoa.toISOString()).toBe('2024-01-20T10:30:00.000Z');
        expect(newZealand.toISOString()).toBe('2024-01-20T10:30:00.000Z');
        expect(samoa.getTime()).toBe(newZealand.getTime());
      });
    });

    describe('Date arithmetic across DST boundaries', () => {
      it('should add 24 hours correctly across DST spring forward', () => {
        // Start before DST transition
        const startDate = service.parseISO8601ToUTC('2024-03-09T12:00:00-05:00');
        const endDate = service.addHours(startDate, 24);
        
        // Should be exactly 24 hours later in UTC
        expect(endDate.toISOString()).toBe('2024-03-10T17:00:00.000Z');
        
        const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        expect(diffHours).toBe(24);
      });

      it('should add 1 day correctly across DST transition', () => {
        const beforeDST = service.parseISO8601ToUTC('2024-03-09T12:00:00Z');
        const afterDST = service.addDays(beforeDST, 1);
        
        // Should be exactly 1 calendar day later
        expect(afterDST.toISOString()).toBe('2024-03-10T12:00:00.000Z');
      });

      it('should calculate days difference correctly across DST', () => {
        const date1 = service.parseISO8601ToUTC('2024-03-09T12:00:00Z');
        const date2 = service.parseISO8601ToUTC('2024-03-12T12:00:00Z');
        
        const diff = service.getDaysDifference(date1, date2);
        expect(diff).toBe(3); // Should be exactly 3 days
      });
    });

    describe('Edge cases for multiple countries', () => {
      it('should handle scheduling across multiple timezones consistently', () => {
        // Meeting at 10 AM EST on Jan 19, 2024
        const meetingEST = service.parseISO8601ToUTC('2024-01-19T10:00:00-05:00');
        
        // Calculate what time this is in other zones (by converting back from UTC)
        const utcTime = meetingEST.toISOString();
        expect(utcTime).toBe('2024-01-19T15:00:00.000Z');
        
        // Someone in IST (+5:30) should join at 20:30 local time
        const istLocal = service.parseISO8601ToUTC('2024-01-19T20:30:00+05:30');
        expect(istLocal.toISOString()).toBe(utcTime);
        
        // Someone in JST (+9:00) should join at 00:00 next day
        const jstLocal = service.parseISO8601ToUTC('2024-01-20T00:00:00+09:00');
        expect(jstLocal.toISOString()).toBe(utcTime);
      });

      it('should handle recurring events across timezone changes', () => {
        // Weekly meeting every Monday at 9 AM UTC
        const week1 = service.parseISO8601ToUTC('2024-03-04T09:00:00Z');
        const week2 = service.addDays(week1, 7);
        const week3 = service.addDays(week2, 7);
        const week4 = service.addDays(week3, 7);
        
        // All should be at same UTC time regardless of DST
        expect(week1.toISOString()).toBe('2024-03-04T09:00:00.000Z');
        expect(week2.toISOString()).toBe('2024-03-11T09:00:00.000Z');
        expect(week3.toISOString()).toBe('2024-03-18T09:00:00.000Z');
        expect(week4.toISOString()).toBe('2024-03-25T09:00:00.000Z');
        
        // All should have same time component in UTC
        expect(week1.getUTCHours()).toBe(9);
        expect(week2.getUTCHours()).toBe(9);
        expect(week3.getUTCHours()).toBe(9);
        expect(week4.getUTCHours()).toBe(9);
      });

      it('should handle year boundary across timezones', () => {
        // New Year's Eve at 11:30 PM in different zones
        const nzNewYear = service.parseISO8601ToUTC('2024-01-01T00:00:00+13:00');
        const ukNewYear = service.parseISO8601ToUTC('2024-01-01T00:00:00+00:00');
        const usNewYear = service.parseISO8601ToUTC('2024-01-01T00:00:00-05:00');
        
        // NZ celebrates first
        expect(nzNewYear.toISOString()).toBe('2023-12-31T11:00:00.000Z');
        // UK is 13 hours later
        expect(ukNewYear.toISOString()).toBe('2024-01-01T00:00:00.000Z');
        // US East Coast is 5 hours after UK
        expect(usNewYear.toISOString()).toBe('2024-01-01T05:00:00.000Z');
        
        // Calculate hours between celebrations
        const nzToUK = (ukNewYear.getTime() - nzNewYear.getTime()) / (1000 * 60 * 60);
        const ukToUS = (usNewYear.getTime() - ukNewYear.getTime()) / (1000 * 60 * 60);
        
        expect(nzToUK).toBe(13);
        expect(ukToUS).toBe(5);
      });
    });

    describe('Leap year and month boundary edge cases', () => {
      it('should handle leap year February 29 across timezones', () => {
        const leapDayStart = service.parseISO8601ToUTC('2024-02-29T00:00:00Z');
        const leapDayEnd = service.parseISO8601ToUTC('2024-02-29T23:59:59Z');
        
        expect(leapDayStart.toISOString()).toBe('2024-02-29T00:00:00.000Z');
        expect(leapDayEnd.toISOString()).toBe('2024-02-29T23:59:59.000Z');
        
        // Add one day should go to March 1
        const nextDay = service.addDays(leapDayStart, 1);
        expect(nextDay.toISOString()).toBe('2024-03-01T00:00:00.000Z');
      });

      it('should handle non-leap year February correctly', () => {
        const feb28 = service.parseISO8601ToUTC('2025-02-28T23:59:59Z');
        const nextSecond = service.addMinutes(feb28, 1); // Add 1 minute to roll over
        
        expect(nextSecond.getUTCMonth()).toBe(2); // March (0-indexed)
        expect(nextSecond.getUTCDate()).toBe(1);
      });
    });
  });
});
