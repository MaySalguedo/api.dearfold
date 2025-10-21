import { Test, TestingModule } from '@nestjs/testing';
import { PipelineFilter } from './pipeline.filter';

describe('PipelineFilter', () => {
  let service: PipelineFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineFilter],
    }).compile();

    service = module.get<PipelineFilter>(PipelineFilter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
