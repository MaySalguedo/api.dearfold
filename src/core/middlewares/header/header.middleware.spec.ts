import { Test, TestingModule } from '@nestjs/testing';
import { HeaderMiddleware } from './header.middleware';

describe('HeaderMiddleware', () => {
  let service: HeaderMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeaderMiddleware],
    }).compile();

    service = module.get<HeaderMiddleware>(HeaderMiddleware);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
