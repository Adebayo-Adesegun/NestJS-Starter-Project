import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthCheckService;
  let db: TypeOrmHealthIndicator;
  let memory: MemoryHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthCheckService>(HealthCheckService);
    db = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
    memory = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('live should return ok', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
  });

  it('check should call healthService.check with indicators', async () => {
    (db.pingCheck as jest.Mock).mockResolvedValue({ db: { status: 'up' } });
    (memory.checkHeap as jest.Mock).mockResolvedValue({ memory: 'ok' });
    (healthService.check as jest.Mock).mockImplementation(
      async (fns: any[]) => {
        // execute provided indicator checks
        const results = await Promise.all(fns.map((fn) => fn()));
        return { status: 'ok', details: results } as any;
      },
    );

    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(healthService.check).toHaveBeenCalled();
    expect(db.pingCheck).toHaveBeenCalledWith('database');
    expect(memory.checkHeap).toHaveBeenCalled();
  });

  it('ready should call healthService.check with db indicator only', async () => {
    (db.pingCheck as jest.Mock).mockResolvedValue({ db: { status: 'up' } });
    (healthService.check as jest.Mock).mockImplementation(
      async (fns: any[]) => {
        const results = await Promise.all(fns.map((fn) => fn()));
        return { status: 'ok', details: results } as any;
      },
    );

    const result = await controller.ready();
    expect(result.status).toBe('ok');
    expect(db.pingCheck).toHaveBeenCalledWith('database');
  });
});
