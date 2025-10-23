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
    const response = await this.requestPreparerService.sendPostRequest(
      this.getNotesEndpoint,
      body,
      headers,
    );
    console.log(response);
    if (response?.responseGetNotes?.payLoad?.entityType === 'Incident') {
      // We have to guess the note period, since it is not given.
      const date = new Date();
      const dateString =
        date.toLocaleDateString('en-US', { month: 'short' }) +
        ' ' +
        date.getFullYear().toString();
      if (response?.responseGetNotes?.payLoad?.notes) {
        for (const note of response.responseGetNotes.payLoad.notes) {
          note.notePeriod = dateString;
        }
      }
    }
    return response;
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
