import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';

@Injectable()
export class NotesService {
  getNotesEndpoint: string;
  submitNotesKKCFSEndpoint: string;
  submitNotesVisitzEndpoint: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
    private readonly submissionFilterService: SubmissionFilterService,
  ) {
    this.getNotesEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.getNotes'),
    );
    this.submitNotesKKCFSEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.submitNotesKKCFS'),
    );
    this.submitNotesVisitzEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.submitNotesVisitz'),
    );
  }

  async getNotes(body, headers) {
    return await this.requestPreparerService.sendPostRequest(
      this.getNotesEndpoint,
      body,
      headers,
    );
  }

  async submitNotesKKCFS(body, headers) {
    await this.submissionFilterService.isEligibleForSubmission(body, headers);
    return await this.requestPreparerService.sendPostRequest(
      this.submitNotesKKCFSEndpoint,
      body,
      headers,
    );
  }

  async submitNotesVisitz(body, headers) {
    await this.submissionFilterService.isEligibleForSubmission(body, headers);
    return await this.requestPreparerService.sendPostRequest(
      this.submitNotesVisitzEndpoint,
      body,
      headers,
    );
  }
}
