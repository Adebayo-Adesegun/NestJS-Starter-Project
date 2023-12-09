import config from './config/app.config';
import { Module } from '@nestjs/common';
import { validate } from './config/env.validation';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UtilityModule } from './utility/utility.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validate,
    }),
    UtilityModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
