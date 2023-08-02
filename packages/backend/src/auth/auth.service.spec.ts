import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { BackendAuthService } from './auth.service'

const config = {
  AUTH0_AUDIENCE: 'audience',
  AUTH0_CLIENT_ID: 'client id',
  AUTH0_CLIENT_SECRET: 'client secret',
  AUTH0_ISSUER_URL: 'issue url',
}

describe('BackendAuthService', () => {
  let service: BackendAuthService
  let axiosPostMock
  let axiosCreateSpy

  beforeEach(async () => {
    axiosPostMock = jest.fn().mockResolvedValue({ data: { auth_token: '' } })

    axiosCreateSpy = jest
      .spyOn<any, any>(axios, 'create')
      .mockReturnValue({ post: axiosPostMock })

    const module: TestingModule = await Test.createTestingModule({
      providers: [BackendAuthService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            getOrThrow: jest.fn().mockImplementation((key) => config[key]),
          }
        }
      })
      .compile()

    service = module.get<BackendAuthService>(BackendAuthService)
  })

  describe('getAuthToken', () => {
    it('should call axios create to create api', () => {
      service.getAuthToken()
      expect(axiosCreateSpy).toHaveBeenCalled()
    })

    it('should call axios post to request auth token', () => {
      service.getAuthToken()
      expect(axiosPostMock).toHaveBeenCalledWith('oauth/token', {
        audience: config[`AUTH0_AUDIENCE`],
        grant_type: 'client_credentials',
        client_id: config[`AUTH0_CLIENT_ID`],
        client_secret: config[`AUTH0_CLIENT_SECRET`],
      })
    })
  })
})
