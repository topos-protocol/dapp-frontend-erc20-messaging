import { Module } from '@nestjs/common'

import { BackendAuthController } from './auth.controller'
import { BackendAuthService } from './auth.service'

@Module({
  controllers: [BackendAuthController],
  providers: [BackendAuthService],
})
export class BackendAuthModule {}
