import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EntityType, RecordType } from '../../common/constants/enumerations';
import { officeNamesSeparator } from '../../common/constants/parameter-constants';
import { QueryHierarchyComponent } from '../../dto/query-hierarchy-component.dto';

@Injectable()
export class UtilitiesService {
  skipJWT: boolean;
  private readonly logger = new Logger(UtilitiesService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.skipJWT = this.configService.get<boolean>('skipJWTCache');
  }

  grabJTI(req: Request): string {
    if (this.skipJWT) {
      return 'local'; // we won't have a JWT locally
    }
    const authToken = req.header('authorization').split(/\s+/)[1];
    try {
      const decoded = this.jwtService.decode(authToken);
      const jti = decoded['jti'];
      return jti;
    } catch {
      const error = `Invalid JWT`;
      this.logger.error(error);
      throw new Error(error);
    }
  }

  cacheKeyPreparer(
    idir: string,
    recordType: RecordType,
    id: string,
    jti: string,
  ): string {
    return `${idir}|${recordType}|${id}|${jti}`;
  }

  findNestedValue(object, key) {
    const value = object[key];
    if (value !== undefined) {
      return value;
    } else {
      for (const keyName of Object.keys(object)) {
        if (object[keyName] !== null && typeof object[keyName] === 'object') {
          const found = this.findNestedValue(object[keyName], key);
          if (found) {
            return found;
          }
        }
      }
    }
  }

  findEntityInfo(body: object): [EntityType, string] {
    try {
      const entityNumber = this.findNestedValue(body, 'entityNumber');
      if (entityNumber !== undefined) {
        return [
          this.findNestedValue(body, 'entityType') as EntityType,
          entityNumber,
        ];
      }

      const incidentNumber = this.findNestedValue(body, 'incidentNumber');
      if (incidentNumber !== undefined) {
        return [EntityType.Incident, incidentNumber];
      }

      const caseIncidentNumber = this.findNestedValue(
        body,
        'caseIncidentNumber',
      );
      return [
        this.findNestedValue(body, 'entityType') as EntityType,
        caseIncidentNumber,
      ];
    } catch (error: any) {
      this.logger.error({ error });
      return [undefined, undefined];
    }
  }

  officeNamesCacheKeyPreparer(idir: string): string {
    return `${idir}|OfficeNames`;
  }

  officeNamesStringToSearchSpec(
    officeNames: string,
    officeFieldName: string,
  ): string {
    let searchspec = `(`;
    const officeNamesArray: Array<string> =
      officeNames.split(officeNamesSeparator);
    for (const officeName of officeNamesArray) {
      searchspec = searchspec + `[${officeFieldName}]='${officeName}' OR `;
    }
    searchspec = searchspec.substring(0, searchspec.length - 4) + `)`;
    return searchspec;
  }

  constructQueryHierarchy(parentComponent: QueryHierarchyComponent): string {
    const queryHierarchy = {};
    const innerObject = this.constructFieldAndSearchSpec(parentComponent);
    queryHierarchy[parentComponent.name] = innerObject;
    return JSON.stringify(queryHierarchy);
  }

  constructFieldAndSearchSpec(component: QueryHierarchyComponent) {
    let fields = ``;
    for (const field of Object.keys(component.classExample)) {
      if (!component.exclude || !component.exclude.includes(field)) {
        fields = fields + field + ',';
      }
    }
    fields = fields.substring(0, fields.length - 1); // remove trailing comma
    const innerObject = { fields };
    if (component.searchspec) {
      innerObject[`searchspec`] = component.searchspec;
    }
    if (component.childComponents) {
      for (const child of component.childComponents) {
        innerObject[child.name] = this.constructFieldAndSearchSpec(child);
      }
    }
    return innerObject;
  }
}
