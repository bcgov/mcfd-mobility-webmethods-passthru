import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../../common/guards/auth/auth.service';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';

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
        { provide: CACHE_MANAGER, useValue: {} },
        UtilitiesService,
        AuthService,
        EntitiesService,
        { provide: HttpService, useValue: { post: jest.fn() } },
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
