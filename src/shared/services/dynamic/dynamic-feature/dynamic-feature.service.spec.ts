import { Test, TestingModule } from '@nestjs/testing';
import { DynamicFeatureService } from './dynamic-feature.service';

describe('DynamicFeatureService', () => {
  let service: DynamicFeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicFeatureService],
    }).compile();

    service = module.get<DynamicFeatureService>(DynamicFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
