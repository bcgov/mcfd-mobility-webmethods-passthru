import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as NodeClam from 'clamscan';
import {
  virusInfectedError,
  virusScanFailedError,
} from '../../common/constants/error-constants';
import { Readable } from 'stream';

@Injectable()
export class VirusScanService {
  buildNumber: string;
  clamScan: NodeClam;
  clamScanConfig: NodeClam.Options;

  private readonly logger = new Logger(VirusScanService.name);

  constructor(private readonly configService: ConfigService) {
    this.buildNumber = this.configService.get<string>('buildInfo.buildNumber');
    this.clamScanConfig = {
      debugMode: this.configService.get<boolean>('clamav.debugMode'),
      clamscan: {
        active: false,
      },
      clamdscan: {
        socket: null,
        host: this.configService.get<string>('clamav.clamdscan.host'),
        port: this.configService.get<number>('clamav.clamdscan.port'),
        timeout: this.configService.get<number>('clamav.clamdscan.timeout'),
        localFallback: false,
        configFile: this.configService.get<string>(
          'clamav.clamdscan.configFile',
        ),
        multiscan: this.configService.get<boolean>(
          'clamav.clamdscan.multiscan',
        ),
        reloadDb: false,
        active: false,
        bypassTest: this.configService.get<boolean>(
          'clamav.clamdscan.bypassTest',
        ),
      },
      preference: 'clamdscan',
    };
  }

  async initNodeClam(): Promise<void> {
    if (this.clamScan === undefined) {
      this.clamScan = await new NodeClam().init(this.clamScanConfig);
    }
  }

  async scanFile(file: Buffer<ArrayBuffer>): Promise<void> {
    await this.initNodeClam();
    const stream = Readable.from(file);
    const result = await this.clamScan.scanStream(stream);
    if (result.isInfected) {
      this.logger.error({
        msg: `File is infected!`,
        viruses: result.viruses,
        buildNumber: this.buildNumber,
      });
      throw new HttpException(virusInfectedError, HttpStatus.OK);
    } else if (result.isInfected === null) {
      this.logger.error({
        msg: `File could not be scanned.`,
        buildNumber: this.buildNumber,
      });
      throw new HttpException(virusScanFailedError, HttpStatus.OK);
    }
    this.logger.log({
      msg: `File is clean!`,
      buildNumber: this.buildNumber,
    });
  }
}
