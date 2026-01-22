import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Config } from '../config/aws.config';
import { ConfigService } from '@nestjs/config';

/**
 * UtilityService
 * 
 * NOTE: For date operations, use DateUtilityService from common/date
 * which provides UTC-safe date operations.
 */
@Injectable()
export class UtilityService {
  constructor(private readonly configService: ConfigService) {}

  parseBoolean(value: string): boolean | undefined {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
    return undefined;
  }

  getDateTicks(): number {
    return new Date().getTime();
  }

  generateRandomNumber(length: number): string {
    if (length <= 0) {
      throw new Error('Invalid OTP length');
    }

    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    const randomNumber = Math.floor(min + Math.random() * (max - min + 1));

    return randomNumber.toString();
  }

  async uploadToS3(file: Express.Multer.File): Promise<string> {
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET'),
      Key: cleanFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      //ACL: 'public-read',
    };

    try {
      const command = new PutObjectCommand(params);
      await s3Config.send(command);
      return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  }
}
