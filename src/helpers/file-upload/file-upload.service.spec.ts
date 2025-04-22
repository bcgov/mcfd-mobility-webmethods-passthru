import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import * as loadEsm from 'load-esm';
import { base64FileString } from '../../common/constants/test-constants';
import { HttpException } from '@nestjs/common';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [FileUploadService, ConfigService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fileBufferAndTypeCheck tests', () => {
    it('should return file buffer on valid file', async () => {
      const file = await service.fileBufferAndTypeCheck(base64FileString);
      expect(file).toBeInstanceOf(Buffer<ArrayBuffer>);
    });
  });

  describe('base64ToFileBuffer tests', () => {
    it('should return buffer on happy path', () => {
      const file = service.base64ToFileBuffer(base64FileString);
      expect(file).toBeInstanceOf(Buffer<ArrayBuffer>);
    });

    it('should throw error on file over max file size', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FileUploadService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const lookup = {
                  'buildInfo.buildNumber': 'local',
                  'fileUpload.maxFileSizeBytes': 1,
                };
                return lookup[key];
              }),
            },
          },
        ],
      }).compile();
      service = module.get<FileUploadService>(FileUploadService);
      expect(() => {
        service.base64ToFileBuffer(base64FileString);
      }).toThrow(HttpException);
    });
  });

  describe('loadFileTypeModule tests', () => {
    it('should only load the module once', async () => {
      const loadSpy = jest.spyOn(loadEsm, 'loadEsm');
      const fileTypeSpy = jest.spyOn(service, 'loadFileTypeModule');
      await service.loadFileTypeModule();
      await service.loadFileTypeModule();
      expect(fileTypeSpy).toHaveBeenCalledTimes(2);
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isValidFileType tests', () => {
    it('should throw error on invalid file type', async () => {
      await service.loadFileTypeModule();
      const fileTypeSpy = jest
        .spyOn(service, 'fileTypeFunction')
        .mockResolvedValueOnce({ mime: 'application/java-archive' });
      await expect(
        service.isValidFileType(Buffer.from([11, 22, 33, 44, 55, 66])),
      ).rejects.toThrow(HttpException);
      expect(fileTypeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
