import { Module } from '@nestjs/common';
import { SafetyAssessmentsService } from './safety-assessments.service';
import { SafetyAssessmentsController } from './safety-assessments.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { EntitiesService } from '../entities/entities.service';
import { HelpersModule } from '../../helpers/helpers.module';
import { AuthModule } from '../../common/guards/auth/auth.module';

@Module({
  imports: [HttpModule, HelpersModule, AuthModule],
  providers: [
    EntitiesService,
    ConfigService,
    RequestPreparerService,
    SafetyAssessmentsService,
  ],
  controllers: [SafetyAssessmentsController],
})
export class SafetyAssessmentsModule {}
