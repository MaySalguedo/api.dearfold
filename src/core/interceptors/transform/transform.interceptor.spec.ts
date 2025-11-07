import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let service: TransformInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    service = module.get<TransformInterceptor>(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
