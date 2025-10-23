import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { Logger as NestJSLogger, VersioningType } from '@nestjs/common';
import { versionNumber } from './common/constants/parameter-constants';
import { urlencoded } from 'express';
import { responseBodyHookMiddleware } from './response-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    httpsOptions: {
      key: process.env.SERVER_KEY.trim(),
      cert: [process.env.SERVER_CERT.trim()],
      ca: process.env.CA_CERT.trim(),
      requestCert: true,
      rejectUnauthorized: true,
    },
  });
  app.use(responseBodyHookMiddleware);
  app.useLogger(app.get(Logger));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: versionNumber,
  });
  const bodyLimit = process.env.BODY_SIZE_LIMIT ?? '7mb';
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  const port = process.env.PORT ?? 3200;
  await app.listen(port);
  const logger = new NestJSLogger();
  logger.log(`API is running on port: ${port}`, { port });
}
bootstrap();
