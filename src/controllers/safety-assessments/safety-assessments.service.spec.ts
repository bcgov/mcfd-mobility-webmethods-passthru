import { Test, TestingModule } from '@nestjs/testing';
import { SafetyAssessmentsService } from './safety-assessments.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

describe('SafetyAssessmentsService', () => {
  let service: SafetyAssessmentsService;
  let requestPreparerService: RequestPreparerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        SafetyAssessmentsService,
        { provide: HttpService, useValue: { post: jest.fn() } },
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
      const body = { body: 'here' };
      const headers = { headers: 'headers' };

      const result = await service.submitSafetyAssessment(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
