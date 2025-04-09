import { Injectable } from '@nestjs/common';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AttachmentsService {
  submitEndpoint: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
  ) {
    this.submitEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.submitAttachment'),
    );
  }

  async submitAttachment(body, headers) {
    return await this.requestPreparerService.sendPostRequest(
      this.submitEndpoint,
      body,
      headers,
    );
  }
}
