import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AuthGuard } from '../../common/guards/auth/auth.guard';

@Controller('')
@UseGuards(AuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('680')
  @HttpCode(200)
  async submitAttachment(@Body() body, @Headers() headers) {
    return await this.attachmentsService.submitAttachment(body, headers);
  }
}
