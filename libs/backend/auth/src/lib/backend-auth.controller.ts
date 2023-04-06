import { BadRequestException, Controller, Get } from '@nestjs/common'
import { BackendAuthService } from './backend-auth.service'

@Controller('auth')
export class BackendAuthController {
  constructor(private backendAuthService: BackendAuthService) {}

  @Get()
  async getAuthToken() {
    return this.backendAuthService.getAuthToken().catch((error) => {
      throw new BadRequestException(error.message)
    })
  }
}
