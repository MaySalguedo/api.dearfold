import { Test, TestingModule } from '@nestjs/testing';
import { TokenGuard } from './token.guard';

describe('TokenGuard', () => {
  let service: TokenGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenGuard],
    }).compile();

    service = module.get<TokenGuard>(TokenGuard);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
