import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from './attachments.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';
import { FileUploadService } from '../../helpers/file-upload/file-upload.service';
import { VirusScanService } from '../../helpers/virus-scan/virus-scan.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { base64FileString } from '../../common/constants/test-constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';
import { idirUsernameHeader } from '../../common/constants/parameter-constants';
import { EntityType } from '../../common/constants/enumerations';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let requestPreparerService: RequestPreparerService;
  let fileUploadService: FileUploadService;
  let virusScanService: VirusScanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        JwtModule.register({ global: true }),
      ],
      providers: [
        AttachmentsService,
        SubmissionFilterService,
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
        UtilitiesService,
        FileUploadService,
        VirusScanService,
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    requestPreparerService = module.get<RequestPreparerService>(
      RequestPreparerService,
    );
    fileUploadService = module.get<FileUploadService>(FileUploadService);
    virusScanService = module.get<VirusScanService>(VirusScanService);
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
      const getRequestSpy = jest
        .spyOn(requestPreparerService, 'sendGetRequest')
        .mockResolvedValueOnce(mockResult);
      const body = {
        docRequest: `{"entityNumber": "numberhere", "entityType": "${EntityType.Case}","requestFormAttachment":{ "payLoad": { "attachment": {"PDFString":"${base64FileString}"}}}, "fileName":"filename"}`,
      };
      const headers = { [idirUsernameHeader.toLowerCase()]: 'idir' };

      const fileUploadSpy = jest
        .spyOn(fileUploadService, 'fileBufferAndTypeCheck')
        .mockResolvedValueOnce(Buffer.from([11, 22, 33, 44, 55, 66]));
      const virusScanSpy = jest
        .spyOn(virusScanService, 'scanFile')
        .mockImplementationOnce(() => {
          return Promise.resolve();
        });

      const result = await service.submitAttachment(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitEndpoint,
        body,
        headers,
      );
      expect(fileUploadSpy).toHaveBeenCalledTimes(1);
      expect(virusScanSpy).toHaveBeenCalledTimes(1);
      expect(getRequestSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
