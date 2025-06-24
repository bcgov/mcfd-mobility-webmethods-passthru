import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesService } from './entities.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('EntitiesService', () => {
  let service: EntitiesService;
  let requestPreparerService: RequestPreparerService;

  const mockResult = { data: 'here' };
  const body = { body: 'here' };
  const headers = { headers: 'headers' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        EntitiesService,
        ConfigService,
        RequestPreparerService,
        TokenRefresherService,
        JwtService,
        {
          provide: HttpService,
          useValue: { post: () => jest.fn(), get: () => jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: () => jest.fn(),
            get: () => 'Bearer token',
          },
        },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
    requestPreparerService = module.get<RequestPreparerService>(
      RequestPreparerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCaseload tests', () => {
    it('should use the getCaseload endpoint and return from the service', async () => {
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);

      const result = await service.getCaseload(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.caseloadEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getEntityDetails tests', () => {
    it('should use the getEntityDetails endpoint and return from the service', async () => {
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);

      const result = await service.getEntityDetails(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.entityDetailsEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
