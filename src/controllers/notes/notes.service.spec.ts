import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

describe('NotesService', () => {
  let service: NotesService;
  let requestPreparerService: RequestPreparerService;

  const mockResult = { data: 'here' };
  const body = { body: 'here' };
  const headers = { headers: 'headers' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        NotesService,
        { provide: HttpService, useValue: { post: jest.fn() } },
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

      const result = await service.submitNotesKKCFS(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitNotesKKCFSEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('submitNotesVisitz tests', () => {
    it('should use the submitNotesVisitz endpoint and return from the service', async () => {
      const requestSpy = jest
        .spyOn(requestPreparerService, 'sendPostRequest')
        .mockResolvedValueOnce(mockResult);

      const result = await service.submitNotesVisitz(body, headers);
      expect(requestSpy).toHaveBeenCalledWith(
        service.submitNotesVisitzEndpoint,
        body,
        headers,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
