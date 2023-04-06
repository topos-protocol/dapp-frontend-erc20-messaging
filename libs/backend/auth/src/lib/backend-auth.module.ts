import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { BackendAuthController } from './backend-auth.controller'
import { BackendAuthService } from './backend-auth.service'

@Module({
  controllers: [BackendAuthController],
  exports: [],
  imports: [ConfigModule],
  providers: [BackendAuthService],
})
export class BackendAuthModule {}
