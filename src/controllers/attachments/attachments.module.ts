import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { HttpModule } from '@nestjs/axios';
import { HelpersModule } from '../../helpers/helpers.module';
import { AuthModule } from '../../common/guards/auth/auth.module';

@Module({
  imports: [HttpModule, HelpersModule, AuthModule],
  providers: [AttachmentsService, ConfigService, RequestPreparerService],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}
