import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from './attachments.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let requestPreparerService: RequestPreparerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        AttachmentsService,
        { provide: HttpService, useValue: { post: jest.fn() } },
        ConfigService,
        RequestPreparerService,
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    requestPreparerService = module.get<RequestPreparerService>(
      RequestPreparerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitAttachment tests', () => {
    it('should use the submitAttachment endpoint and return from the service', async () => {
      const mockResult = { data: 'here' };
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);
      const body = { body: 'here' };
      const headers = { headers: 'headers' };

      const result = await service.submitAttachment(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
