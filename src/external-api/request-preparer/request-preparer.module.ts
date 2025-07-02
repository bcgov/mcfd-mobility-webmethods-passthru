import { Module } from '@nestjs/common';
import { RequestPreparerService } from './request-preparer.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TokenRefresherService } from '../token-refresher/token-refresher.service';

@Module({
  imports: [HttpModule],
  providers: [RequestPreparerService, ConfigService, TokenRefresherService],
  exports: [RequestPreparerService],
})
export class RequestPreparerModule {}
