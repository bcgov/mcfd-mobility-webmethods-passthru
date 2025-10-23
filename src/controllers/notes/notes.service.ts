import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { SubmissionFilterService } from '../../helpers/submission-filter/submission-filter.service';

@Injectable()
export class NotesService {
  getNotesEndpoint: string;
  submitNotesKKCFSEndpoint: string;
  submitNotesVisitzEndpoint: string;
  private readonly logger = new Logger(NotesService.name);
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
    const redactedNotes = [];
    if (response.responseGetNotes?.payLoad?.notes) {
      for (const note of response.responseGetNotes.payLoad.notes) {
        redactedNotes.push({
          notePeriod: note.notePeriod,
          createdDate: note.createdDate,
          noteLength: (note.notes as string).length,
          isNotFoundResponse:
            note.notes ===
            'No Notes are found for the requested Service Request/Incident/Case number in ICM',
        });
      }
    }
    const redactedResponse = {
      responseGetNotes: {
        payLoad: {
          error: response.responseGetNotes?.payLoad?.error,
          entityNumber: response.responseGetNotes?.payLoad?.entityNumber,
          entityType: response.responseGetNotes?.payLoad?.entityType,
          notes: redactedNotes,
        },
      },
    };
    this.logger.log(redactedResponse);
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
    const response = await this.requestPreparerService.sendPostRequest(
      this.submitNotesVisitzEndpoint,
      body,
      headers,
    );
    const redactedResponse = {
      responseSubmitNotes: {
        payLoad: {
          status: response.responseSubmitNotes?.payLoad?.status,
          noteId: response.responseSubmitNotes?.payLoad?.noteId,
          error: response.responseSubmitNotes?.payLoad?.error,
        },
      },
    };
    this.logger.log(redactedResponse);
    return response;
  }
}
