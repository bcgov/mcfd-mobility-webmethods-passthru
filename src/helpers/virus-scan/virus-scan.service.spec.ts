import { Test, TestingModule } from '@nestjs/testing';
import { VirusScanService } from './virus-scan.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import * as NodeClam from 'clamscan';
import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('VirusScanService', () => {
  let service: VirusScanService;
  let file: Buffer<ArrayBuffer>;
  const filename = 'filename';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [VirusScanService, ConfigService],
    }).compile();

    service = module.get<VirusScanService>(VirusScanService);
    file = Buffer.from([11, 22, 33, 44, 55, 66]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scanFile tests', () => {
    it('should return without error on a clean file', async () => {
      jest.spyOn(NodeClam.prototype, 'init').mockReturnValue();
      service.clamScan = new NodeClam();
      const scanSpy = jest
        .spyOn(service.clamScan, 'scanStream')
        .mockImplementationOnce(() => {
          return { file: null, isInfected: false, viruses: [] };
        });
      await service.scanFile(file, filename);
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error on infected file', async () => {
      jest.spyOn(NodeClam.prototype, 'init').mockReturnValue();
      service.clamScan = new NodeClam();
      const scanSpy = jest
        .spyOn(service.clamScan, 'scanStream')
        .mockImplementationOnce(() => {
          return { file: null, isInfected: true, viruses: ['virus here'] };
        });
      await expect(service.scanFile(file, filename)).rejects.toThrow(
        BadRequestException,
      );
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error on null return from clamav', async () => {
      jest.spyOn(NodeClam.prototype, 'init').mockReturnValue();
      service.clamScan = new NodeClam();
      const scanSpy = jest
        .spyOn(service.clamScan, 'scanStream')
        .mockImplementationOnce(() => {
          return { file: null, isInfected: null, viruses: [] };
        });
      await expect(service.scanFile(file, filename)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });
  });
});
