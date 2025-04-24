import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

@Injectable()
export class EntitiesService {
  caseloadEndpoint: string;
  entityDetailsEndpoint: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
  ) {
    this.caseloadEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.caseload'),
    );
    this.entityDetailsEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.entityDetails'),
    );
  }

  async getCaseload(body, headers) {
    return await this.requestPreparerService.sendPostRequest(
      this.caseloadEndpoint,
      body,
      headers,
    );
  }

  async getEntityDetails(body, headers) {
    return await this.requestPreparerService.sendPostRequest(
      this.entityDetailsEndpoint,
      body,
      headers,
    );
  }
}
