import { Module } from '@nestjs/common';
import { UtilitiesModule } from './utilities/utilities.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { VirusScanModule } from './virus-scan/virus-scan.module';
import { UtilitiesService } from './utilities/utilities.service';
import { FileUploadService } from './file-upload/file-upload.service';
import { VirusScanService } from './virus-scan/virus-scan.service';
import { ConfigService } from '@nestjs/config';
import { SubmissionFilterModule } from './submission-filter/submission-filter.module';

@Module({
  imports: [
    UtilitiesModule,
    FileUploadModule,
    VirusScanModule,
    SubmissionFilterModule,
  ],
  providers: [
    UtilitiesService,
    ConfigService,
    FileUploadService,
    VirusScanService,
  ],
  exports: [UtilitiesService, FileUploadService, VirusScanService],
})
export class HelpersModule {}
