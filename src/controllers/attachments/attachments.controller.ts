import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';

@Controller('')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('680')
  async submitAttachment(@Body() body, @Headers() headers) {
    return await this.attachmentsService.submitAttachment(body, headers);
  }
}
