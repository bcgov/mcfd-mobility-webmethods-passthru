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

@Module({
  imports: [HttpModule, HelpersModule, AuthModule],
  providers: [
    AttachmentsService,
    ConfigService,
    RequestPreparerService,
    FileUploadService,
    VirusScanService,
  ],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}
