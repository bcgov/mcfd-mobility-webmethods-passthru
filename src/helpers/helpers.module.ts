import { Module } from '@nestjs/common';
import { UtilitiesModule } from './utilities/utilities.module';

@Module({
  imports: [UtilitiesModule],
})
export class HelpersModule {}
