import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [FileUploadService, ConfigService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
