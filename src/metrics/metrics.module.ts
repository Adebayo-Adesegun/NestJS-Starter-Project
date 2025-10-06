import { Controller, Get, Module, Res } from '@nestjs/common';
import { Response } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

@Controller('metrics')
class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}

@Module({
  controllers: [MetricsController],
})
export class MetricsModule {}
