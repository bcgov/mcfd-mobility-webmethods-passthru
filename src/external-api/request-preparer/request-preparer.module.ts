import { Module } from '@nestjs/common';
import { RequestPreparerService } from './request-preparer.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [RequestPreparerService, ConfigService],
  exports: [RequestPreparerService],
})
export class RequestPreparerModule {}
