import { Body, Controller, Headers, Post } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Controller('')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post('620b')
  async getCaseload(@Body() body, @Headers() headers) {
    return await this.entitiesService.getCaseload(body, headers);
  }

  @Post('621b')
  async getEntityDetails(@Body() body, @Headers() headers) {
    return await this.entitiesService.getEntityDetails(body, headers);
  }
}
