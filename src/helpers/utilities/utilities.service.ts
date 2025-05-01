import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RecordType } from '../../common/constants/enumerations';

@Injectable()
export class UtilitiesService {
  skipJWT: boolean;

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
    const decoded = this.jwtService.decode(authToken);
    try {
      const jti = decoded['jti'];
      return jti;
    } catch {
      throw new Error(`Invalid JWT`);
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
}
