import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

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
      controllers: [NotesController],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotes tests', () => {
    it('should return from the service', async () => {
      const serviceSpy = jest
        .spyOn(service, 'getNotes')
        .mockResolvedValueOnce(mockResult);

      const result = await controller.getNotes(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });

  describe('submitNotesKKCFS tests', () => {
    it('should return from the service', async () => {
      const serviceSpy = jest
        .spyOn(service, 'submitNotesKKCFS')
        .mockResolvedValueOnce(mockResult);

      const result = await controller.submitNotesKKCFS(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });

  describe('submitNotesVisitz tests', () => {
    it('should return from the service', async () => {
      const serviceSpy = jest
        .spyOn(service, 'submitNotesVisitz')
        .mockResolvedValueOnce(mockResult);

      const result = await controller.submitNotesVisitz(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });
});
