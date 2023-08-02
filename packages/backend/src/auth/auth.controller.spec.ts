import { Test, TestingModule } from '@nestjs/testing'

import { BackendAuthController } from './auth.controller'
import { BackendAuthService } from './auth.service'
import { BadRequestException } from '@nestjs/common'

describe('BackendAuthController', () => {
  let controller: BackendAuthController
  let service: BackendAuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackendAuthController],
    })
      .useMocker((token) => {
        if (token === BackendAuthService) {
          return {
            getAuthToken: jest.fn().mockResolvedValue({}),
          }
        }
      })
      .compile()

    controller = module.get<BackendAuthController>(BackendAuthController)
    service = module.get<BackendAuthService>(BackendAuthService)
  })

  describe('getAuthToken', () => {
    it('should call service', () => {
      controller.getAuthToken()
      expect(service.getAuthToken).toBeCalled()
    })

    it('should return bad request exception if service rejects', () => {
      jest.spyOn(service, 'getAuthToken').mockRejectedValueOnce('error')
      expect(controller.getAuthToken()).rejects.toBeInstanceOf(
        BadRequestException
      )
    })
  })
})
