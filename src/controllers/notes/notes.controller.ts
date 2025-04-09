import { Body, Controller, Headers, Post } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller('')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('678')
  async getNotes(@Body() body, @Headers() headers) {
    return await this.notesService.getNotes(body, headers);
  }

  @Post('679')
  async submitNotesKKCFS(@Body() body, @Headers() headers) {
    return await this.notesService.submitNotesKKCFS(body, headers);
  }

  @Post('679c')
  async submitNotesVisitz(@Body() body, @Headers() headers) {
    return await this.notesService.submitNotesVisitz(body, headers);
  }
}
