import { Module } from '@nestjs/common';
import { wrapRequestSerializer, res as pinoRes } from 'pino-std-serializers';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ControllersModule } from './controllers/controllers.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { HelpersModule } from './helpers/helpers.module';
import configuration from './configuration/configuration';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          customSuccessObject: (req, res, loggableObject) => {
            return {
              ...loggableObject,
              res,
              buildNumber: configService.get('buildInfo.buildNumber'),
            };
          },
          customErrorObject: (req, res, loggableObject) => {
            return {
              ...loggableObject,
              res,
              buildNumber: configService.get('buildInfo.buildNumber'),
            };
          },
          customReceivedObject: (req, res, loggableObject) => {
            return {
              ...loggableObject,
              buildNumber: configService.get('buildInfo.buildNumber'),
              msg: 'Request received',
            };
          },
          serializers: {
            req: wrapRequestSerializer((req) => {
              return {
                id: req.raw.id,
                method: req.raw.method,
                path: req.raw.url,
                query: req.query,
                params: req.params,
                // Allowlist useful headers
                headers: {
                  host: req.raw.headers.host,
                  connection: req.raw.headers.connection,
                  'x-forwarded-proto': req.raw.headers['x-forwarded-proto'],
                  'x-forwarded-host': req.raw.headers['x-forwarded-host'],
                  'x-forwarded-port': req.raw.headers['x-forwarded-port'],
                  'x-forwarded-path': req.raw.headers['x-forwarded-path'],
                  'x-real-ip': req.raw.headers['x-real-ip'],
                  'user-agent': req.raw.headers['user-agent'],
                  accept: req.raw.headers.accept,
                  'accept-language': req.raw.headers['accept-language'],
                  'x-credential-identifier':
                    req.raw.headers['x-credential-identifier'],
                  'x-idir-username': req.raw.headers['x-idir-username'],
                  'x-authenticated-groups':
                    req.raw.headers['x-authenticated-groups'],
                  'kong-request-id': req.raw.headers['kong-request-id'],
                  referer: req.raw.headers.referer,
                },
                remoteAddress: req.remoteAddress,
                remotePort: req.remotePort,
              };
            }),
            res(res) {
              return {
                ...pinoRes(res.raw),
                body: JSON.parse(res.raw.locals.responseBody || '{}'),
              };
            },
            // statusCode: res.raw.statusCode,
            // headers: res.headers,
          },
        },
      }),
    }),
    CacheModule.register({ isGlobal: true }),
    JwtModule.register({ global: true }),
    ControllersModule,
    ExternalApiModule,
    HelpersModule,
  ],
})
export class AppModule {}
