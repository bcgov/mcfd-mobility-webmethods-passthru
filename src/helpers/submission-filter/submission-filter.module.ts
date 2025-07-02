import { Module } from '@nestjs/common';
import { SubmissionFilterService } from './submission-filter.service';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { HttpModule } from '@nestjs/axios';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';

@Module({
  imports: [HttpModule],
  providers: [
    SubmissionFilterService,
    ConfigService,
    RequestPreparerService,
    UtilitiesService,
    TokenRefresherService,
  ],
  exports: [SubmissionFilterService],
})
export class SubmissionFilterModule {}
