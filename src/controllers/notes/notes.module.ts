import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { EntitiesService } from '../entities/entities.service';
import { HelpersModule } from '../../helpers/helpers.module';
import { AuthModule } from '../../common/guards/auth/auth.module';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';

@Module({
  imports: [HttpModule, HelpersModule, AuthModule],
  providers: [
    EntitiesService,
    ConfigService,
    NotesService,
    RequestPreparerService,
    TokenRefresherService,
    SubmissionFilterService,
  ],
  controllers: [NotesController],
})
export class NotesModule {}
