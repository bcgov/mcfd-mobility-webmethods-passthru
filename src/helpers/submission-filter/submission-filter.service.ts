import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  EntityRecordMap,
  EntityStatus,
  RestrictedRecordEnum,
} from '../../common/constants/enumerations';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { restrictedNotOpenPostError } from '../../common/constants/error-constants';
import { UtilitiesService } from '../utilities/utilities.service';
import { idirUsernameHeader } from '../../common/constants/parameter-constants';

@Injectable()
export class SubmissionFilterService {
  caseIdFieldName: string;
  incidentIdFieldName: string;
  srIdFieldName: string;
  memoIdFieldName: string;
  caseRestrictedFieldName: string;
  incidentRestrictedFieldName: string;
  srRestrictedFieldName: string;
  memoRestrictedFieldName: string;
  caseStatusFieldName: string;
  incidentStatusFieldName: string;
  srStatusFieldName: string;
  memoStatusFieldName: string;
  caseWorkspace: string;
  incidentWorkspace: string;
  srWorkspace: string;
  memoWorkspace: string;
  caseURL: string;
  incidentURL: string;
  srURL: string;
  memoURL: string;

  private readonly logger = new Logger(SubmissionFilterService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly requestPreparerService: RequestPreparerService,
    private readonly utilitiesService: UtilitiesService,
  ) {
    this.caseIdFieldName = this.configService.get<string>(`auth.case.idField`);
    this.incidentIdFieldName = this.configService.get<string>(
      `auth.incident.idField`,
    );
    this.srIdFieldName = this.configService.get<string>(`auth.sr.idField`);
    this.memoIdFieldName = this.configService.get<string>(`auth.memo.idField`);
    this.caseRestrictedFieldName = this.configService.get<string>(
      `auth.case.restrictedField`,
    );
    this.incidentRestrictedFieldName = this.configService.get<string>(
      `auth.incident.restrictedField`,
    );
    this.srRestrictedFieldName = this.configService.get<string>(
      `auth.sr.restrictedField`,
    );
    this.memoRestrictedFieldName = this.configService.get<string>(
      `auth.memo.restrictedField`,
    );
    this.caseStatusFieldName = this.configService.get<string>(
      `auth.case.statusField`,
    );
    this.incidentStatusFieldName = this.configService.get<string>(
      `auth.incident.statusField`,
    );
    this.srStatusFieldName =
      this.configService.get<string>(`auth.sr.statusField`);
    this.memoStatusFieldName = this.configService.get<string>(
      `auth.memo.statusField`,
    );
    this.caseWorkspace = this.configService.get<string>(`auth.case.workspace`);
    this.incidentWorkspace = this.configService.get<string>(
      `auth.incident.workspace`,
    );
    this.srWorkspace = this.configService.get<string>(`auth.sr.workspace`);
    this.memoWorkspace = this.configService.get<string>(`auth.memo.workspace`);
    this.caseURL = encodeURI(
      this.configService.get<string>('endpointUrls.dataApiUrl') +
        this.configService.get<string>(`auth.case.endpoint`),
    );
    this.incidentURL = encodeURI(
      this.configService.get<string>('endpointUrls.dataApiUrl') +
        this.configService.get<string>(`auth.incident.endpoint`),
    );
    this.srURL = encodeURI(
      this.configService.get<string>('endpointUrls.dataApiUrl') +
        this.configService.get<string>(`auth.sr.endpoint`),
    );
    this.memoURL = encodeURI(
      this.configService.get<string>('endpointUrls.dataApiUrl') +
        this.configService.get<string>(`auth.memo.endpoint`),
    );
  }

  async isEligibleForSubmission(body: object, header: object): Promise<void> {
    const idir = header[`${idirUsernameHeader}`.toLowerCase()].trim();
    const [entityType, entityNumber] = this.utilitiesService.findEntityInfo(
      JSON.parse(body['docRequest']),
    );
    const recordType = EntityRecordMap[entityType];
    const recordIdFieldName = `${recordType}IdFieldName`;
    const recordRestrictedFieldName = `${recordType}RestrictedFieldName`;
    const recordStatusFieldName = `${recordType}StatusFieldName`;
    const recordWorkspace = this[`${recordType}Workspace`];
    const recordURL = this[`${recordType}URL`];
    const baseSearchSpec =
      `([${this[recordIdFieldName]}]="${entityNumber}" AND ` +
      `[${this[recordRestrictedFieldName]}]="${RestrictedRecordEnum.False}" ` +
      `AND [${this[recordStatusFieldName]}]="${EntityStatus.Open}"`;
    const [headers, params] =
      this.requestPreparerService.prepareHeadersAndParams(
        baseSearchSpec,
        recordWorkspace,
        true,
        idir,
      );
    let response;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      response = await this.requestPreparerService.sendGetRequest(
        recordURL,
        headers,
        params,
      );
    } catch {
      this.logger.error(
        `Parent ${recordType} record with id number '${entityNumber}' is not open or is restricted`,
      );
      throw new BadRequestException([restrictedNotOpenPostError]);
    }
  }
}
