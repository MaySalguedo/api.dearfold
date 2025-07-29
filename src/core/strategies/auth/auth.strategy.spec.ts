import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.strategy';

describe('AuthStrategy', () => {
  let service: AuthStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthStrategy],
    }).compile();

    service = module.get<AuthStrategy>(AuthStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
