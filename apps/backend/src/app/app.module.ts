import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { BackendAuthModule } from '@dapp-frontend-cross-subnet/backend/auth'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend'),
    }),
    BackendAuthModule,
  ],
})
export class AppModule {}
