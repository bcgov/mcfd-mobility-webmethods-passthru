import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';

@Injectable()
export class NotesService {
  getNotesEndpoint: string;
  submitNotesKKCFSEndpoint: string;
  submitNotesVisitzEndpoint: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
  ) {
    this.getNotesEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.getNotes'),
    );
    this.submitNotesKKCFSEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.submitNotesKKCFS'),
    );
    this.submitNotesVisitzEndpoint = encodeURI(
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
    return await this.requestPreparerService.sendPostRequest(
      this.submitNotesKKCFSEndpoint,
      body,
      headers,
    );
  }

  async submitNotesVisitz(body, headers) {
    return await this.requestPreparerService.sendPostRequest(
      this.submitNotesVisitzEndpoint,
      body,
      headers,
    );
  }
}
