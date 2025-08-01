import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let service: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    service = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
