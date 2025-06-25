import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
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
import { EntityType } from '../../common/constants/enumerations';

describe('NotesService', () => {
  let service: NotesService;
  let requestPreparerService: RequestPreparerService;

  const mockResult = { data: 'here' };
  const body = {
    docRequest: JSON.stringify({
      entityNumber: 'numberhere',
      entityType: EntityType.Memo,
    }),
  };
  const headers = { [idirUsernameHeader.toLowerCase()]: 'idir' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        NotesService,
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

    service = module.get<NotesService>(NotesService);
    requestPreparerService = module.get<RequestPreparerService>(
      RequestPreparerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotes tests', () => {
    it('should use the getNotes endpoint and return from the service', async () => {
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);

      const result = await service.getNotes(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.getNotesEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('submitNotesKKCFS tests', () => {
    it('should use the submitNotesKKCFS endpoint and return from the service', async () => {
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);
      const getRequestSpy = jest
        .spyOn(requestPreparerService, 'sendGetRequest')
        .mockResolvedValueOnce(mockResult);

      const result = await service.submitNotesKKCFS(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitNotesKKCFSEndpoint,
        body,
        headers,
      );
      expect(getRequestSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('submitNotesVisitz tests', () => {
    it('should use the submitNotesVisitz endpoint and return from the service', async () => {
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);
      const getRequestSpy = jest
        .spyOn(requestPreparerService, 'sendGetRequest')
        .mockResolvedValueOnce(mockResult);

      const result = await service.submitNotesVisitz(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitNotesVisitzEndpoint,
        body,
        headers,
      );
      expect(getRequestSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
