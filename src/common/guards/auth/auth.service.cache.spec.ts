import { getMockReq } from '@jest-mock/express';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { AuthService } from './auth.service';
import {
  idirUsernameHeader,
  officeNamesSeparator,
} from '../../../common/constants/parameter-constants';
import { UtilitiesService } from '../../../helpers/utilities/utilities.service';
import { TokenRefresherService } from '../../../external-api/token-refresher/token-refresher.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * These tests use the real cache library rather than a mock, so that a change
 * in how cache-manager reports a missing key is caught here.
 */
describe('AuthService with a real cache', () => {
  let service: AuthService;
  let cache: Cache;

  const testIdir = 'IDIRTEST';
  const officeNames = `office1${officeNamesSeparator}office2`;
  const cacheTtlMs = 150;
  const caseRequest = {
    docRequest:
      '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
  };

  const buildRequest = (body: object = {}) =>
    getMockReq({
      header: jest.fn((key: string): string => {
        const headerVal: { [key: string]: string } = {
          [idirUsernameHeader]: testIdir,
        };
        return headerVal[key];
      }),
      body,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        AuthService,
        TokenRefresherService,
        UtilitiesService,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const lookup = {
                'recordCache.cacheTtlMs': cacheTtlMs,
                skipJWTCache: true,
              };
              return lookup[key];
            }),
          },
        },
        { provide: HttpService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
    cache = module.get(CACHE_MANAGER);
  });

  describe('cache library contract', () => {
    it('should report a missing key as a miss', async () => {
      expect(await cache.get('missing')).toBeUndefined();
    });

    it('should report an expired key as a miss', async () => {
      await cache.set('expiring', 'value', 50);
      expect(await cache.get('expiring')).toBe('value');
      await sleep(120);
      expect(await cache.get('expiring')).toBeUndefined();
    });

    it('should report a key set to undefined as a miss', async () => {
      await cache.set('undefinedValue', undefined, 1000);
      expect(await cache.get('undefinedValue')).toBeUndefined();
    });

    it.each([
      ['false', false],
      ['true', true],
      ['a status code', 200],
      ['a string', officeNames],
    ])('should return a stored %s as is', async (_label, value) => {
      await cache.set('stored', value, 1000);
      expect(await cache.get('stored')).toBe(value);
    });
  });

  describe('non caseload authorization', () => {
    beforeEach(async () => {
      await cache.set(testIdir, true, 10000);
      await cache.set(
        service['utilitiesService'].officeNamesCacheKeyPreparer(testIdir),
        officeNames,
        10000,
      );
    });

    it('should verify the record upstream instead of trusting the employee cache', async () => {
      const assignedSpy = jest
        .spyOn(service, 'getIsAssignedToOfficeUpstream')
        .mockResolvedValue([false, 'searchspec']);
      const employeeSpy = jest.spyOn(service, 'getEmployeeActiveUpstream');

      const isAuthed = await service.getRecordAndValidate(
        buildRequest(caseRequest),
        false,
      );

      expect(assignedSpy).toHaveBeenCalledTimes(1);
      expect(employeeSpy).not.toHaveBeenCalled();
      expect(isAuthed).toBe(false);
    });

    it('should cache an approved record and skip upstream on the next request', async () => {
      const assignedSpy = jest
        .spyOn(service, 'getIsAssignedToOfficeUpstream')
        .mockResolvedValue([true, 'searchspec']);

      const first = await service.getRecordAndValidate(
        buildRequest(caseRequest),
        false,
      );
      const second = await service.getRecordAndValidate(
        buildRequest(caseRequest),
        false,
      );

      expect(first).toBe(true);
      expect(second).toBe(true);
      expect(assignedSpy).toHaveBeenCalledTimes(1);
    });

    it('should go back upstream once the cached record expires', async () => {
      const assignedSpy = jest
        .spyOn(service, 'getIsAssignedToOfficeUpstream')
        .mockResolvedValue([true, 'searchspec']);

      await service.getRecordAndValidate(buildRequest(caseRequest), false);
      await sleep(cacheTtlMs + 100);
      await cache.set(testIdir, true, 10000);
      await cache.set(
        service['utilitiesService'].officeNamesCacheKeyPreparer(testIdir),
        officeNames,
        10000,
      );
      await service.getRecordAndValidate(buildRequest(caseRequest), false);

      expect(assignedSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('caseload authorization', () => {
    it('should go upstream for an unknown employee and cache the result', async () => {
      const employeeSpy = jest
        .spyOn(service, 'getEmployeeActiveUpstream')
        .mockImplementation(async (idir: string) => {
          await cache.set(idir, true, 10000);
          await cache.set(`${idir}|OfficeNames`, officeNames, 10000);
          return [true, officeNames];
        });

      const first = await service.getRecordAndValidate(buildRequest(), true);
      const second = await service.getRecordAndValidate(buildRequest(), true);

      expect(first).toBe(true);
      expect(second).toBe(true);
      expect(employeeSpy).toHaveBeenCalledTimes(1);
    });

    it('should go upstream again for an employee whose cache entry was set to undefined', async () => {
      await cache.set(testIdir, false, 10000);
      await cache.set(`${testIdir}|OfficeNames`, undefined, 10000);
      const employeeSpy = jest
        .spyOn(service, 'getEmployeeActiveUpstream')
        .mockResolvedValue([true, officeNames]);

      const isAuthed = await service.getRecordAndValidate(buildRequest(), true);

      expect(employeeSpy).toHaveBeenCalledTimes(1);
      expect(isAuthed).toBe(true);
    });
  });
});
