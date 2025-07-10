import { Inject, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import {
  EntityRecordMap,
  RecordType,
} from '../../../common/constants/enumerations';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import {
  authIdirHeaderName,
  CHILD_LINKS,
  CONTENT_TYPE,
  idirUsernameHeader,
  officeNamesSeparator,
  queryHierarchyEmployeeChildClassName,
  queryHierarchyEmployeeParentClassName,
  queryHierarchyParamName,
  UNIFORM_RESPONSE,
  uniformResponseParamName,
  VIEW_MODE,
} from '../../../common/constants/parameter-constants';
import { firstValueFrom } from 'rxjs';
import { TokenRefresherService } from '../../../external-api/token-refresher/token-refresher.service';
import { UtilitiesService } from '../../../helpers/utilities/utilities.service';
import { PositionExample } from '../../../entities/position.entity';
import { QueryHierarchyComponent } from '../../../dto/query-hierarchy-component.dto';
import { EmployeeExample } from '../../../entities/employee.entity';

@Injectable()
export class AuthService {
  skipJWT: boolean;
  cacheTime: number;
  basedataApiUrl: string;
  buildNumber: string;
  employeeWorkspace: string;
  employeeEndpoint: string;
  restrictToOrganization: string | undefined;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly utilitiesService: UtilitiesService,
    private readonly httpService: HttpService,
    private readonly tokenRefresherService: TokenRefresherService,
  ) {
    this.cacheTime = this.configService.get<number>('recordCache.cacheTtlMs');
    this.basedataApiUrl = encodeURI(
      this.configService.get<string>('endpointUrls.dataApiUrl'),
    );
    this.buildNumber = this.configService.get<string>('buildInfo.buildNumber');
    this.skipJWT = this.configService.get<boolean>('skipJWTCache');
    this.employeeWorkspace = this.configService.get<string>(
      'auth.employee.workspace',
    );
    this.employeeEndpoint = this.configService.get<string>(
      'auth.employee.endpoint',
    );
    this.restrictToOrganization = this.configService.get<string | undefined>(
      'auth.employee.restrictToOrg',
    );
  }

  async getRecordAndValidate(
    req: Request,
    isCaseload: boolean,
  ): Promise<boolean> {
    let idir: string;
    try {
      idir = req.header(idirUsernameHeader).trim();
    } catch {
      this.logger.error(`Idir username not found`);
      return false;
    }
    if (!isCaseload) {
      return this.nonCaseloadCheck(idir, req);
    }
    const officeNamesKey =
      this.utilitiesService.officeNamesCacheKeyPreparer(idir);
    let employeeActive: boolean | null = await this.cacheManager.get(idir);
    let officeNames: string | null =
      await this.cacheManager.get(officeNamesKey);
    if (employeeActive === null || officeNames === null) {
      this.logger.log(`Cache not hit for employee status, going upstream...`);
      [employeeActive, officeNames] =
        await this.getEmployeeActiveUpstream(idir);
    } else {
      this.logger.log(
        `Cache hit for employee status! Key: ${idir} Result: ${employeeActive}`,
      );
      const readableOfficeNames =
        typeof officeNames === 'string'
          ? `["` + officeNames.replace(officeNamesSeparator, `","`) + `"]`
          : officeNames;
      this.logger.log(
        `Cache hit for employee offices! Key: ${officeNamesKey} Result: ${readableOfficeNames}`,
      );
    }
    if (employeeActive === false || officeNames === undefined) {
      return false;
    }
    return true;
  }

  async nonCaseloadCheck(idir: string, req: Request) {
    let jti: string;
    try {
      jti = this.utilitiesService.grabJTI(req);
    } catch (error: any) {
      this.logger.error({ error });
      return false;
    }
    let entityInfo;
    try {
      entityInfo = JSON.parse(req.body.docRequest);
    } catch {
      this.logger.error(`Could not parse docRequest JSON`);
      return false;
    }
    const [entityType, entityNumber] =
      this.utilitiesService.findEntityInfo(entityInfo);
    if (entityType === undefined || entityNumber === undefined) {
      this.logger.error(`Entity Type or Number not found`);
      return false;
    }
    const recordType = EntityRecordMap[entityType];
    const key = this.utilitiesService.cacheKeyPreparer(
      idir,
      recordType,
      entityNumber,
      jti,
    );
    const officeNamesKey =
      this.utilitiesService.officeNamesCacheKeyPreparer(idir);
    let upstreamResult: number | null | undefined =
      await this.cacheManager.get(key);
    let employeeActive: boolean | null = await this.cacheManager.get(idir);
    let officeNames: string | null =
      await this.cacheManager.get(officeNamesKey);

    if (employeeActive === null || officeNames === null) {
      this.logger.log(
        `Cache not hit for record type and active status, going upstream...`,
      );
      let isAssignedToOffice: boolean = false,
        searchspec: string = 'Not Set';
      [employeeActive, officeNames] =
        await this.getEmployeeActiveUpstream(idir);
      if (employeeActive === true && officeNames !== null) {
        [isAssignedToOffice, searchspec] =
          await this.getIsAssignedToOfficeUpstream(
            entityNumber,
            recordType,
            idir,
            officeNames,
          );
      }
      upstreamResult = await this.evaluateUpstreamResult(
        isAssignedToOffice,
        idir,
        key,
        searchspec,
      );
    } else if (upstreamResult === null) {
      this.logger.log(`Cache not hit for record type, going upstream...`);
      const [isAssignedToOffice, searchspec] =
        await this.getIsAssignedToOfficeUpstream(
          entityNumber,
          recordType,
          idir,
          officeNames,
        );
      upstreamResult = await this.evaluateUpstreamResult(
        isAssignedToOffice,
        idir,
        key,
        searchspec,
      );
    } else {
      this.logger.log(
        `Cache hit for record type! Key: ${key} Result: ${upstreamResult}`,
      );
      this.logger.log(
        `Cache hit for employee status! Key: ${idir} Result: ${employeeActive}`,
      );
      const readableOfficeNames =
        typeof officeNames === 'string'
          ? `["` + officeNames.replace(officeNamesSeparator, `","`) + `"]`
          : officeNames;
      this.logger.log(
        `Cache hit for employee offices! Key: ${officeNamesKey} Result: ${readableOfficeNames}`,
      );
    }
    if (
      upstreamResult === 403 ||
      employeeActive === false ||
      officeNames === undefined
    ) {
      return false;
    }
    return true;
  }

  async evaluateUpstreamResult(
    isAssignedToOffice: boolean,
    idir: string,
    key: string,
    searchspec: string,
  ) {
    const authStatus = isAssignedToOffice ? 200 : 403;
    if (isAssignedToOffice === true) {
      await this.cacheManager.set(key, authStatus, this.cacheTime);
      this.logger.log(
        `Assigned To Office check: user '${idir}' is assigned to record`,
      );
    } else {
      this.logger.log(
        `Assigned To Office check: failed with searchspec '${searchspec}'`,
      );
    }
    const upstreamResult = authStatus;
    return upstreamResult;
  }

  async positionCheck(
    idir: string,
    response,
  ): Promise<[boolean, string | null]> {
    const officeNames = [];
    const officeNamesKey =
      this.utilitiesService.officeNamesCacheKeyPreparer(idir);
    if (this.restrictToOrganization !== undefined) {
      const primaryOrganizationId =
        response.data['items'][0]['Primary Organization Id'];
      let foundPositionOrganization: boolean = false;
      for (const position of response.data['items'][0][
        queryHierarchyEmployeeChildClassName
      ]) {
        if (position['Organization Id'] === primaryOrganizationId) {
          foundPositionOrganization = true;
          if (position['Organization'] !== this.restrictToOrganization) {
            this.logger.error({
              msg: `Employees with primary organization '${position['Organization']}' are restricted from using this API.`,
              buildNumber: this.buildNumber,
              function: this.getEmployeeActiveUpstream.name,
            });
            await this.cacheManager.set(
              officeNamesKey,
              undefined,
              this.cacheTime,
            );
            await this.cacheManager.set(idir, false, this.cacheTime);
            return [false, null];
          }
        }
        officeNames.push(position['Division']);
      }
      if (foundPositionOrganization === false) {
        this.logger.error({
          msg: `Primary organization with id '${primaryOrganizationId}' not found in Employee Position array.`,
          buildNumber: this.buildNumber,
          function: this.getEmployeeActiveUpstream.name,
        });
        await this.cacheManager.set(officeNamesKey, undefined, this.cacheTime);
        await this.cacheManager.set(idir, false, this.cacheTime);
        return [false, null];
      }
    }
    const officeNamesString = officeNames.join(officeNamesSeparator);
    await this.cacheManager.set(
      officeNamesKey,
      officeNamesString,
      this.cacheTime,
    );
    await this.cacheManager.set(idir, true, this.cacheTime);
    return [true, officeNamesString];
  }

  async getIsAssignedToOfficeUpstream(
    id: string,
    recordType: RecordType,
    idir: string,
    officeNames: string,
  ): Promise<[boolean | undefined, string]> {
    let workspace;
    const idirFieldName = this.configService.get<string>(
      `auth.${recordType}.searchspecIdirField`,
    );
    const idFieldName = this.configService.get<string>(
      `auth.${recordType}.idField`,
    );
    const officeFieldName = this.configService.get<string>(
      `auth.${recordType}.officeField`,
    );
    let searchspec =
      `([${idFieldName}]='${id}') AND (` +
      this.utilitiesService.officeNamesStringToSearchSpec(
        officeNames,
        officeFieldName,
      );
    searchspec = searchspec.substring(0, searchspec.length - 1) + `) OR `;
    if (recordType === RecordType.Case || recordType == RecordType.Incident) {
      searchspec = searchspec + `EXISTS `;
    }
    searchspec = searchspec + `([${idirFieldName}]='${idir}'))`;
    const params = {
      ViewMode: VIEW_MODE,
      ChildLinks: CHILD_LINKS,
      [uniformResponseParamName]: UNIFORM_RESPONSE,
      searchspec,
    };
    if (
      (workspace = this.configService.get(`auth.${recordType}.workspace`)) !==
      undefined
    ) {
      params['workspace'] = workspace;
    }
    const headers = {
      Accept: CONTENT_TYPE,
      'Accept-Encoding': '*',
      [authIdirHeaderName]: idir,
    };
    const url =
      this.basedataApiUrl +
      this.configService.get<string>(`auth.${recordType}.endpoint`);

    let response;
    try {
      const token =
        await this.tokenRefresherService.refreshUpstreamBearerToken();
      if (token === undefined) {
        throw new Error('Upstream auth failed');
      }
      headers['Authorization'] = token;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      response = await firstValueFrom(
        this.httpService.get(url, { params, headers }),
      );
      return [true, searchspec];
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error({
          msg: error.message,
          errorDetails: error.response?.data,
          stack: error.stack,
          cause: error.cause,
          buildNumber: this.buildNumber,
          function: this.getIsAssignedToOfficeUpstream.name,
        });
      } else {
        this.logger.error({ error, buildNumber: this.buildNumber });
      }
    }
    return [false, searchspec];
  }

  async getEmployeeActiveUpstream(
    idir: string,
  ): Promise<[boolean, string | null]> {
    const officeNamesKey =
      this.utilitiesService.officeNamesCacheKeyPreparer(idir);
    const params = {
      ViewMode: 'Catalog',
      ChildLinks: CHILD_LINKS,
      [uniformResponseParamName]: UNIFORM_RESPONSE,
      excludeEmptyFieldsInResponse: 'true',
      [queryHierarchyParamName]: this.utilitiesService.constructQueryHierarchy(
        new QueryHierarchyComponent({
          classExample: EmployeeExample,
          name: queryHierarchyEmployeeParentClassName,
          searchspec: `([Login Name]="${idir}" AND [Employment Status]="Active")`,
          childComponents: [
            new QueryHierarchyComponent({
              classExample: PositionExample,
              name: queryHierarchyEmployeeChildClassName,
            }),
          ],
        }),
      ),
    };
    if (this.employeeWorkspace !== undefined) {
      params['workspace'] = this.employeeWorkspace;
    }
    const headers = {
      Accept: CONTENT_TYPE,
      'Accept-Encoding': '*',
      [authIdirHeaderName]: idir,
    };
    const url = this.basedataApiUrl + this.employeeEndpoint;

    let response;
    try {
      const token =
        await this.tokenRefresherService.refreshUpstreamBearerToken();
      if (token === undefined) {
        throw new Error('Upstream auth failed');
      }
      headers['Authorization'] = token;
      response = await firstValueFrom(
        this.httpService.get(url, { params, headers }),
      );
      return await this.positionCheck(idir, response);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error({
          msg: error.message,
          errorDetails: error.response?.data,
          stack: error.stack,
          cause: error.cause,
          buildNumber: this.buildNumber,
          function: this.getEmployeeActiveUpstream.name,
        });
        await this.cacheManager.set(officeNamesKey, undefined, this.cacheTime);
        await this.cacheManager.set(idir, false, this.cacheTime);
      } else {
        this.logger.error({ error, buildNumber: this.buildNumber });
      }
    }
    return [false, undefined];
  }
}
