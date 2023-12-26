import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [UtilityService],
  exports: [UtilityService],
})
export class UtilityModule {}
