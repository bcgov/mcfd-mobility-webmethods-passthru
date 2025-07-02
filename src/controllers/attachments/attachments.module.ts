import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { HttpModule } from '@nestjs/axios';
import { HelpersModule } from '../../helpers/helpers.module';
import { AuthModule } from '../../common/guards/auth/auth.module';
import { FileUploadService } from '../../helpers/file-upload/file-upload.service';
import { VirusScanService } from '../../helpers/virus-scan/virus-scan.service';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';

@Module({
  imports: [HttpModule, HelpersModule, AuthModule],
  providers: [
    AttachmentsService,
    ConfigService,
    RequestPreparerService,
    FileUploadService,
    VirusScanService,
    TokenRefresherService,
    SubmissionFilterService,
  ],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}
