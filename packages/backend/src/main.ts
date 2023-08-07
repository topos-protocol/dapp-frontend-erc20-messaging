import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { otelSDK } from './tracing'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // await otelSDK.start()

  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)

  const port = process.env.PORT || 3000
  await app.listen(port)

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  )
}

bootstrap()
