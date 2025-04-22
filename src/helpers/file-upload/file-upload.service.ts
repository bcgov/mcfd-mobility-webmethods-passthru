import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadEsm } from 'load-esm';
import {
  fileSizeError,
  fileTypeError,
} from '../../common/constants/error-constants';

@Injectable()
export class FileUploadService {
  private readonly allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ];
  fileTypeFunction;
  maxFileSize: number;
  buildNumber: string;

  private readonly logger = new Logger(FileUploadService.name);
  constructor(private readonly configService: ConfigService) {
    this.maxFileSize = this.configService.get<number>(
      'fileUpload.maxFileSizeBytes',
    );
    this.buildNumber = this.configService.get<string>('buildInfo.buildNumber');
  }

  async fileBufferAndTypeCheck(input: string) {
    const file = this.base64ToFileBuffer(input);
    await this.isValidFileType(file);
    return file;
  }

  base64ToFileBuffer(input: string): Buffer {
    const file = Buffer.from(input, 'base64');
    if (file.byteLength > this.maxFileSize) {
      this.logger.error({
        msg: fileSizeError,
        buildNumber: this.buildNumber,
        function: this.base64ToFileBuffer.name,
      });
      throw new HttpException(fileSizeError, HttpStatus.OK);
    }
    return file;
  }

  // This dynamic import has to be done because it is a pure ESM module, and we're using commonJS
  async loadFileTypeModule() {
    if (this.fileTypeFunction === undefined) {
      const { fileTypeFromBuffer } =
        await loadEsm<typeof import('file-type')>('file-type');
      this.fileTypeFunction = fileTypeFromBuffer;
    }
  }

  /**
   * Indicates if this file should be considered valid.
   * @param file the file as a buffer
   */
  async isValidFileType(file: Buffer<ArrayBuffer>): Promise<boolean> {
    await this.loadFileTypeModule();
    const fileType = await this.fileTypeFunction(file);
    if (
      fileType === undefined ||
      !this.allowedFileTypes.includes(fileType.mime)
    ) {
      this.logger.error({
        msg: fileTypeError,
        buildNumber: this.buildNumber,
        function: this.isValidFileType.name,
      });
      throw new HttpException(fileTypeError, HttpStatus.OK);
    }
    return true;
  }
}
