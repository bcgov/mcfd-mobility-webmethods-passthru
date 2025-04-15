import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SafetyAssessmentsModule } from './safety-assessments/safety-assessments.module';
import { EntitiesModule } from './entities/entities.module';

@Module({
  imports: [
    NotesModule,
    AttachmentsModule,
    SafetyAssessmentsModule,
    EntitiesModule,
  ],
})
export class ControllersModule {}
