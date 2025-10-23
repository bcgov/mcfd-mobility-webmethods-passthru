import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { AuthGuard } from '../../common/guards/auth/auth.guard';

@Controller('')
@UseGuards(AuthGuard)
export class NotesController {
  private readonly logger = new Logger(NotesController.name);
  constructor(private readonly notesService: NotesService) {}

  @Post('678')
  @HttpCode(200)
  async getNotes(@Body() body, @Headers() headers) {
    this.logger.log(body); // nothing to redact, just entity numbers
    return await this.notesService.getNotes(body, headers);
  }

  @Post('679')
  @HttpCode(200)
  async submitNotesKKCFS(@Body() body, @Headers() headers) {
    return await this.notesService.submitNotesKKCFS(body, headers);
  }

  @Post('679C')
  @HttpCode(200)
  async submitNotesVisitz(@Body() body, @Headers() headers) {
    const redactedRequest = JSON.parse(JSON.stringify(body));
    if (redactedRequest.requestSubmitNotes?.payLoad?.notes) {
      if (
        typeof redactedRequest.requestSubmitNotes?.payLoad?.notes === 'string'
      ) {
        redactedRequest['requestSubmitNotes']['payLoad']['noteLength'] =
          redactedRequest['requestSubmitNotes']['payLoad']['notes'].length;
      } else if (
        Array.isArray(redactedRequest.requestSubmitNotes?.payLoad?.notes)
      ) {
        redactedRequest['requestSubmitNotes']['payLoad']['noteArrayLength'] =
          redactedRequest['requestSubmitNotes']['payLoad']['notes'].length;
      }
      delete redactedRequest['requestSubmitNotes']['payLoad']['notes'];
    }
    this.logger.log(redactedRequest);
    return await this.notesService.submitNotesVisitz(body, headers);
  }
}
