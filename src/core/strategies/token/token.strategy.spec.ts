import { Test, TestingModule } from '@nestjs/testing';
import { TokenStrategy } from './token.strategy';

describe('TokenStrategy', () => {
  let service: TokenStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenStrategy],
    }).compile();

    service = module.get<TokenStrategy>(TokenStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
