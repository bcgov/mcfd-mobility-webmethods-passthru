import { Test, TestingModule } from '@nestjs/testing';
import { RequestPreparerService } from './request-preparer.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
} from 'axios';
import { of } from 'rxjs';
import { HttpException } from '@nestjs/common';

describe('RequestPreparerService', () => {
  let service: RequestPreparerService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        RequestPreparerService,
        {
          provide: HttpService,
          useValue: { post: () => jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: () => jest.fn(),
            get: () => 'Bearer token',
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<RequestPreparerService>(RequestPreparerService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPostRequest tests', () => {
    it('provides a response on sucessful http service call', async () => {
      const spy = jest.spyOn(httpService, 'post').mockReturnValueOnce(
        of({
          data: {},
          headers: {},
          status: 200,
          statusText: 'OK',
        } as AxiosResponse<any, any>),
      );
      const result = await service.sendPostRequest('url', {}, {});
      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });

    it.each([[500]])(
      `Should return AxiosError with matching status on axios error`,
      async (status) => {
        const spy = jest.spyOn(httpService, 'post').mockImplementation(() => {
          throw new AxiosError(
            'Axios Error',
            status.toString(),
            {} as InternalAxiosRequestConfig,
            {},
            {
              data: {},
              status: status,
              statusText: '',
              headers: {} as RawAxiosRequestHeaders,
              config: {} as InternalAxiosRequestConfig,
            },
          );
        });

        await expect(
          service.sendPostRequest('url', {}, {}),
        ).rejects.toHaveProperty('status', status);
        expect(spy).toHaveBeenCalledTimes(1);
      },
    );
  });

  it(`Should return HttpException on other error`, async () => {
    const spy = jest.spyOn(httpService, 'post').mockImplementation(() => {
      throw new Error('generic error');
    });

    await expect(service.sendPostRequest('url', {}, {})).rejects.toThrow(
      HttpException,
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
