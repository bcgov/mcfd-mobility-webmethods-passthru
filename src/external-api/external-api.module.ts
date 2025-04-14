import { Module } from '@nestjs/common';
import { RequestPreparerModule } from './request-preparer/request-preparer.module';

@Module({
  imports: [RequestPreparerModule],
})
export class ExternalApiModule {}
