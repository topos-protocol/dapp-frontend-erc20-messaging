import { Test, TestingModule } from '@nestjs/testing'
import { BackendAuthController } from './backend-auth.controller'

describe('BackendAuthController', () => {
  let controller: BackendAuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackendAuthController],
    }).compile()

    controller = module.get<BackendAuthController>(BackendAuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
