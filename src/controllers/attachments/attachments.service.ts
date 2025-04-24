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
      this.configService.get<string>('endpointUrls.workflowUrl') +
        this.configService.get<string>('endpointUrls.submitAttachment'),
    );
  }

  async submitAttachment(body, headers) {
    const reqField = JSON.parse(body.docRequest);
    const fileString =
      reqField.requestFormAttachment.payLoad.attachment.PDFString;
    const filename = this.utilitiesService.findNestedValue(
      reqField,
      'fileName',
    );
    const fileBuffer = await this.fileUploadService.fileBufferAndTypeCheck(
      fileString,
      filename,
    );
    await this.virusScanService.scanFile(fileBuffer, filename);
    return await this.requestPreparerService.sendPostRequest(
      this.submitEndpoint,
      body,
      headers,
    );
  }
}
