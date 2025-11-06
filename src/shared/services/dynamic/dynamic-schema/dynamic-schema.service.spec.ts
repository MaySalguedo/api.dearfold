import { Test, TestingModule } from '@nestjs/testing';
import { DynamicSchemaService } from './dynamic-schema.service';

describe('DynamicSchemaService', () => {
  let service: DynamicSchemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicSchemaService],
    }).compile();

    service = module.get<DynamicSchemaService>(DynamicSchemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
