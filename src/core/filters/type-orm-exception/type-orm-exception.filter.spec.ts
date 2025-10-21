import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExceptionFilterService } from './type-orm-exception.filter';

describe('TypeOrmExceptionFilter', () => {
  let service: TypeOrmExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeOrmExceptionFilterService],
    }).compile();

    service = module.get<TypeOrmExceptionFilterService>(TypeOrmExceptionFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
