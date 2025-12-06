import { Test, TestingModule } from '@nestjs/testing';
import { AuditLoggerService } from './audit-logger.service';
import { Logger } from '@nestjs/common';

describe('AuditLoggerService', () => {
  let service: AuditLoggerService;
  let loggerSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLoggerService],
    }).compile();

    service = module.get<AuditLoggerService>(AuditLoggerService);

    // Spy on logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log event with no metadata', () => {
      service.log('TEST_EVENT');

      expect(loggerSpy).toHaveBeenCalledWith('TEST_EVENT');
    });

    it('should log event with simple metadata', () => {
      service.log('TEST_EVENT', { user_id: 123, action: 'test' });

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('TEST_EVENT'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('user_id: 123'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('action: test'),
      );
    });

    it('should hash email addresses in metadata', () => {
      service.log('PASSWORD_RESET_REQUESTED', {
        email: 'user@example.com',
      });

      const logCall = loggerSpy.mock.calls[0][0];
      expect(logCall).toContain('email_hash:');
      expect(logCall).toContain('email_domain: example.com');
      expect(logCall).not.toContain('user@example.com');
    });

    it('should use warn level when specified', () => {
      service.log('RATE_LIMIT_EXCEEDED', { ip: '1.2.3.4' }, 'warn');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT_EXCEEDED'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('ip: 1.2.3.4'),
      );
    });

    it('should use error level when specified', () => {
      service.log('CRITICAL_ERROR', { reason: 'system_failure' }, 'error');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL_ERROR'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('reason: system_failure'),
      );
    });

    it('should handle empty metadata object', () => {
      service.log('TEST_EVENT', {});

      expect(loggerSpy).toHaveBeenCalledWith('TEST_EVENT');
    });

    it('should format multiple metadata fields correctly', () => {
      service.log('MULTI_FIELD_EVENT', {
        field1: 'value1',
        field2: 'value2',
        field3: 123,
      });

      const logCall = loggerSpy.mock.calls[0][0];
      expect(logCall).toContain('field1: value1');
      expect(logCall).toContain('field2: value2');
      expect(logCall).toContain('field3: 123');
    });
  });
});
