import { Test, TestingModule } from '@nestjs/testing';
import { UtilityService } from './utility.service';
import { ConfigService } from '@nestjs/config';

// Mock the S3 client used in the service
const sendMock = jest.fn();
jest.mock('../config/aws.config', () => ({
  s3Config: { send: (...args: any[]) => sendMock(...args) },
}));

describe('UtilityService', () => {
  let service: UtilityService;

  beforeEach(async () => {
    sendMock.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilityService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_BUCKET') return 'test-bucket';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UtilityService>(UtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseBoolean', () => {
    it('parses true/false strings', () => {
      expect(service.parseBoolean('true')).toBe(true);
      expect(service.parseBoolean('false')).toBe(false);
    });
    it('returns undefined for non-boolean strings', () => {
      expect(service.parseBoolean('maybe')).toBeUndefined();
    });
  });

  describe('getDateTicks', () => {
    it('returns a positive timestamp', () => {
      const ticks = service.getDateTicks();
      expect(typeof ticks).toBe('number');
      expect(ticks).toBeGreaterThan(0);
    });
  });

  describe('generateRandomNumber', () => {
    it('generates a numeric string with requested length', () => {
      const code = service.generateRandomNumber(6);
      expect(code).toMatch(/^\d{6}$/);
    });
    it('throws for invalid length', () => {
      expect(() => service.generateRandomNumber(0)).toThrow('Invalid OTP length');
      expect(() => service.generateRandomNumber(-2)).toThrow('Invalid OTP length');
    });
  });

  describe('date helpers', () => {
    const onlyDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();

    it('computes first/last dates correctly relative to now', () => {
      const firstLastMonth = service.getFirstDateOfLastMonth();
      const lastLastMonth = service.getLastDateOfLastMonth();
      const firstThisMonth = service.getFirstDateOfCurrentMonth();
      const lastThisMonth = service.getLastDateOfCurrentMonth();

      // Recompute expected values using the same logic
      const now = new Date();
      const expectedFirstLastMonth = new Date(now);
      expectedFirstLastMonth.setDate(1);
      expectedFirstLastMonth.setMonth(expectedFirstLastMonth.getMonth() - 1);

      const expectedLastLastMonth = new Date(now);
      expectedLastLastMonth.setDate(0);

      const expectedFirstThisMonth = new Date(now);
      expectedFirstThisMonth.setDate(1);

      const expectedLastThisMonth = new Date(expectedFirstThisMonth);
      expectedLastThisMonth.setMonth(expectedLastThisMonth.getMonth() + 1);
      expectedLastThisMonth.setDate(0);

      expect(onlyDate(firstLastMonth)).toBe(onlyDate(expectedFirstLastMonth));
      expect(onlyDate(lastLastMonth)).toBe(onlyDate(expectedLastLastMonth));
      expect(onlyDate(firstThisMonth)).toBe(onlyDate(expectedFirstThisMonth));
      expect(onlyDate(lastThisMonth)).toBe(onlyDate(expectedLastThisMonth));
    });
  });

  describe('uploadToS3', () => {
    it('uploads and returns the file URL', async () => {
      sendMock.mockResolvedValue({});
      const file = {
        originalname: 'my document (final).pdf',
        buffer: Buffer.from('data'),
        mimetype: 'application/pdf',
      } as unknown as Express.Multer.File;

      const url = await service.uploadToS3(file);
      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(url).toBe('https://test-bucket.s3.amazonaws.com/mydocumentfinal.pdf');
    });

    it('throws when upload fails', async () => {
      sendMock.mockRejectedValue(new Error('S3 error'));
      const file = {
        originalname: 'doc.pdf',
        buffer: Buffer.from('data'),
        mimetype: 'application/pdf',
      } as unknown as Express.Multer.File;
      await expect(service.uploadToS3(file)).rejects.toThrow('Failed to upload file');
    });
  });
});
