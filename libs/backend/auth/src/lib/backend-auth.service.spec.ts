import { Test, TestingModule } from '@nestjs/testing'
import { BackendAuthService } from './backend-auth.service'

describe('BackendAuthService', () => {
  let service: BackendAuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackendAuthService],
    }).compile()

    service = module.get<BackendAuthService>(BackendAuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
