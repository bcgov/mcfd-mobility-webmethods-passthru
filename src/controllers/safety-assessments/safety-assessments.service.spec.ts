import { Test, TestingModule } from '@nestjs/testing';
import { SafetyAssessmentsService } from './safety-assessments.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';
import { idirUsernameHeader } from '../../common/constants/parameter-constants';

describe('SafetyAssessmentsService', () => {
  let service: SafetyAssessmentsService;
  let requestPreparerService: RequestPreparerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        SafetyAssessmentsService,
        SubmissionFilterService,
        UtilitiesService,
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
        ConfigService,
        RequestPreparerService,
      ],
    }).compile();

    service = module.get<SafetyAssessmentsService>(SafetyAssessmentsService);
    requestPreparerService = module.get<RequestPreparerService>(
      RequestPreparerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitSafetyAssessment tests', () => {
    it('should use the safety assessment endpoint and return from the service', async () => {
      const mockResult = { data: 'here' };
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);
      const getRequestSpy = jest
        .spyOn(requestPreparerService, 'sendGetRequest')
        .mockResolvedValueOnce(mockResult);
      const body = {
        docRequest: JSON.stringify({ incidentNumber: 'numberhere' }),
      };
      const headers = { [idirUsernameHeader.toLowerCase()]: 'idir' };

      const result = await service.submitSafetyAssessment(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitEndpoint,
        body,
        headers,
      );
      expect(getRequestSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
