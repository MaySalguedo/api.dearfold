import { Test, TestingModule } from '@nestjs/testing';
import { ErrorMappingService } from './error-mapping.service';

describe('ErrorMappingService', () => {
  let service: ErrorMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorMappingService],
    }).compile();

    service = module.get<ErrorMappingService>(ErrorMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
