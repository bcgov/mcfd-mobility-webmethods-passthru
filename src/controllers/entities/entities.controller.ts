import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { AuthGuard } from '../../common/guards/auth/auth.guard';

@Controller('')
@UseGuards(AuthGuard)
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post('620b')
  @HttpCode(200)
  async getCaseload(@Body() body, @Headers() headers) {
    return await this.entitiesService.getCaseload(body, headers);
  }

  @Post('621b')
  @HttpCode(200)
  async getEntityDetails(@Body() body, @Headers() headers) {
    return await this.entitiesService.getEntityDetails(body, headers);
  }
}
