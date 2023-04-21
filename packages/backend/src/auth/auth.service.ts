import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

import { OAuthResponse } from 'common'

interface OAuthTokenDto {
  audience: string
  grant_type: string
  client_id: string
  client_secret: string
}

@Injectable()
export class BackendAuthService {
  private _auth0Api: AxiosInstance

  constructor(private configService: ConfigService) {
    this._auth0Api = this._createAuth0Api()
  }

  getAuthToken() {
    return this._auth0Api
      .post<OAuthResponse, AxiosResponse<OAuthResponse>, OAuthTokenDto>(
        'oauth/token',
        {
          audience: this.configService.getOrThrow(`AUTH0_AUDIENCE`),
          grant_type: 'client_credentials',
          client_id: this.configService.getOrThrow(`AUTH0_CLIENT_ID`),
          client_secret: this.configService.getOrThrow(`AUTH0_CLIENT_SECRET`),
        }
      )
      .then(({ data }) => data)
      .catch(console.error)
  }

  private _createAuth0Api() {
    return axios.create({
      baseURL: this.configService.getOrThrow(`AUTH0_ISSUER_URL`),
    })
  }
}
