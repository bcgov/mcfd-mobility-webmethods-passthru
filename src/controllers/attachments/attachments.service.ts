import { Injectable } from '@nestjs/common';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '../../helpers/file-upload/file-upload.service';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';
import { VirusScanService } from '../../helpers/virus-scan/virus-scan.service';

@Injectable()
export class AttachmentsService {
  submitEndpoint: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
    private readonly utilitiesService: UtilitiesService,
    private readonly fileUploadService: FileUploadService,
    private readonly virusScanService: VirusScanService,
  ) {
    this.submitEndpoint = encodeURI(
      this.configService.get<string>('endpointUrls.baseUrl') +
        this.configService.get<string>('endpointUrls.submitAttachment'),
    );
  }

  async submitAttachment(body, headers) {
    const fileString = this.utilitiesService.findNestedValue(
      JSON.parse(body.docRequest),
      'PDFString',
    );
    const fileBuffer =
      await this.fileUploadService.fileBufferAndTypeCheck(fileString);
    await this.virusScanService.scanFile(fileBuffer);
    return await this.requestPreparerService.sendPostRequest(
      this.submitEndpoint,
      body,
      headers,
    );
  }
}
