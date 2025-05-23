import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { UtilitiesService } from '../../../helpers/utilities/utilities.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { getMockReq } from '@jest-mock/express';
import { TokenRefresherService } from '../../../external-api/token-refresher/token-refresher.service';
import { JwtModule } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let service: AuthService;
  let configService: ConfigService;
  let guard;

  @Controller()
  class TestController {
    @UseGuards(AuthGuard)
    async example() {
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { getRecordAndValidate: () => jest.fn() },
        },
        TokenRefresherService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: () => jest.fn(),
            get: () => jest.fn(),
          },
        },
        UtilitiesService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const lookup = {
                skipAuthGuard: true,
              };
              return lookup[key];
            }),
          },
        },
        { provide: HttpService, useValue: { get: jest.fn() } },
      ],
      imports: [JwtModule.register({ global: true })],
      controllers: [TestController],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    const guards = Reflect.getMetadata(
      '__guards__',
      TestController.prototype.example,
    );
    guard = new guards[0](service, configService);
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(AuthGuard);
  });

  describe('canActivate tests', () => {
    it.each([[true, false]])(
      'should return the result of getRecordAndValidate when not skipping',
      async (returnValue) => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            AuthService,
            TokenRefresherService,
            { provide: CACHE_MANAGER, useValue: {} },
            UtilitiesService,
            {
              provide: ConfigService,
              useValue: {
                get: jest.fn((key: string) => {
                  const lookup = {
                    skipAuthGuard: false,
                  };
                  return lookup[key];
                }),
              },
            },

            { provide: HttpService, useValue: { get: jest.fn() } },
          ],
          imports: [JwtModule.register({ global: true })],
        }).compile();
        service = module.get<AuthService>(AuthService);
        configService = module.get<ConfigService>(ConfigService);
        const guards = Reflect.getMetadata(
          '__guards__',
          TestController.prototype.example,
        );
        guard = new guards[0](service, configService);

        const authSpy = jest
          .spyOn(service, 'getRecordAndValidate')
          .mockResolvedValueOnce(returnValue);
        const guardSpy = jest.spyOn(AuthGuard.prototype, 'canActivate');
        const execContext = {
          switchToHttp: () => ({
            getRequest: () => getMockReq(),
          }),
          getClass: () => {
            return TestController;
          },
          getHandler: () => {
            return { name: TestController.name };
          },
        };
        const isAuthed = await guard.canActivate(execContext);
        expect(authSpy).toHaveBeenCalledTimes(1);
        expect(guardSpy).toHaveBeenCalledTimes(1);
        expect(isAuthed).toBe(returnValue);
      },
    );
  });
});
