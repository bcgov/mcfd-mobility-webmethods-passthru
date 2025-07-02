import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '../../common/guards/auth/auth.service';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';

describe('EntitiesController', () => {
  let controller: EntitiesController;
  let service: EntitiesService;

  const mockResult = { data: 'here' };
  const body = { body: 'here' };
  const headers = { headers: 'headers' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        JwtModule.register({ global: true }),
      ],
      providers: [
        TokenRefresherService,
        SubmissionFilterService,
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
        UtilitiesService,
        AuthService,
        EntitiesService,
        ConfigService,
        RequestPreparerService,
      ],
      controllers: [EntitiesController],
    }).compile();

    controller = module.get<EntitiesController>(EntitiesController);
    service = module.get<EntitiesService>(EntitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCaseload tests', () => {
    it('should return from the service', async () => {
      const serviceSpy = jest
        .spyOn(service, 'getCaseload')
        .mockResolvedValueOnce(mockResult);

      const result = await controller.getCaseload(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getEntityDetails tests', () => {
    it('should return from the service', async () => {
      const serviceSpy = jest
        .spyOn(service, 'getEntityDetails')
        .mockResolvedValueOnce(mockResult);

      const result = await controller.getEntityDetails(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });
});
