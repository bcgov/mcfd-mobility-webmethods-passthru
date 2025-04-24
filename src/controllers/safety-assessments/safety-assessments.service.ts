import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

@Injectable()
export class SafetyAssessmentsService {
  submitEndpoint: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
  ) {
    this.submitEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.submitSafetyAssessment'),
    );
  }

  async submitSafetyAssessment(body, headers) {
    return await this.requestPreparerService.sendPostRequest(
      this.submitEndpoint,
      body,
      headers,
    );
  }
}
