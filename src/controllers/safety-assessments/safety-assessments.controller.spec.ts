import { Test, TestingModule } from '@nestjs/testing';
import { SafetyAssessmentsController } from './safety-assessments.controller';
import { SafetyAssessmentsService } from './safety-assessments.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';
import { AuthService } from '../../common/guards/auth/auth.service';

describe('SafetyAssessmentsController', () => {
  let controller: SafetyAssessmentsController;
  let service: SafetyAssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        JwtModule.register({ global: true }),
      ],
      providers: [
        SafetyAssessmentsService,
        TokenRefresherService,
        AuthService,
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: HttpService, useValue: { post: jest.fn() } },
        ConfigService,
        UtilitiesService,
        RequestPreparerService,
      ],
      controllers: [SafetyAssessmentsController],
    }).compile();

    controller = module.get<SafetyAssessmentsController>(
      SafetyAssessmentsController,
    );
    service = module.get<SafetyAssessmentsService>(SafetyAssessmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitSafetyAssessment tests', () => {
    it('should return from the service', async () => {
      const mockResult = { data: 'here' };
      const serviceSpy = jest
        .spyOn(service, 'submitSafetyAssessment')
        .mockResolvedValueOnce(mockResult);
      const body = { body: 'here' };
      const headers = { headers: 'headers' };

      const result = await controller.submitSafetyAssessment(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });
});
