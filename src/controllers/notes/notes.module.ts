import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { EntitiesService } from '../entities/entities.service';

@Module({
  imports: [HttpModule],
  providers: [
    EntitiesService,
    ConfigService,
    NotesService,
    RequestPreparerService,
  ],
  controllers: [NotesController],
})
export class NotesModule {}
