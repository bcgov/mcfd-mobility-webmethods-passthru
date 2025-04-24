import { Module } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [UtilitiesService, ConfigService],
  exports: [UtilitiesService],
})
export class UtilitiesModule {}
