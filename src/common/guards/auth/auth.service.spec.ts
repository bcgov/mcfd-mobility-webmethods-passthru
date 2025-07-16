import { getMockReq } from '@jest-mock/express';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
} from 'axios';
import { Cache } from 'cache-manager';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { EntityType, RecordType } from '../../../common/constants/enumerations';
import { UtilitiesService } from '../../../helpers/utilities/utilities.service';
import { TokenRefresherService } from '../../../external-api/token-refresher/token-refresher.service';
import {
  idirUsernameHeader,
  officeNamesSeparator,
  queryHierarchyEmployeeChildClassName,
} from '../../../common/constants/parameter-constants';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let httpService: HttpService;
  let utilitiesService: UtilitiesService;
  let cache: Cache;

  const validId = 'id1234';
  const validRecordType = RecordType.Case;
  const testIdir = 'IDIRTEST';
  const testOrg = 'testorg';
  const testOrgId = 'testorgid';
  const officeNames = `office1${officeNamesSeparator}office2`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenRefresherService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: () => jest.fn(),
            get: () => jest.fn(),
          },
        },
        UtilitiesService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const lookup = {
                [`auth.${validRecordType}.searchspecIdirField`]: 'testfield',
                [`auth.${validRecordType}.workspace`]: 'testspace',
                'recordCache.cacheTtlMs': 1000000,
                skipJWTCache: true,
                [`auth.employee.restrictToOrg`]: testOrg,
              };
              return lookup[key];
            }),
          },
        },
        { provide: HttpService, useValue: { get: jest.fn() } },
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
    utilitiesService = module.get<UtilitiesService>(UtilitiesService);
    cache = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecordAndValidate tests', () => {
    it('should return true with valid record for non caseload auth', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('')
        .mockResolvedValueOnce('');
      const spy = jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(
          of({
            data: {
              items: [
                {
                  'Login Name': testIdir,
                  'Employment Status': 'Active',
                  'Primary Organization Id': testOrgId,
                  [queryHierarchyEmployeeChildClassName]: [
                    {
                      'Organization Id': testOrgId,
                      Organization: testOrg,
                    },
                  ],
                },
              ],
            },
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        )
        .mockReturnValueOnce(
          of({
            data: {
              items: [
                {
                  [configService.get(
                    `upstreamAuth.${validRecordType}.idirField`,
                  )]: testIdir,
                },
              ],
            },
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        );
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: testIdir,
          };
          return headerVal[key];
        }),
        body: {
          docRequest:
            '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
        },
      });
      const isAuthed = await service.getRecordAndValidate(mockRequest, false);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(cacheSpy).toHaveBeenCalledTimes(5);
      expect(isAuthed).toBe(true);
    });

    it('should return true for non caseload auth without employee in cache', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('')
        .mockResolvedValueOnce('');
      const spy = jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(
          of({
            data: {
              items: [
                {
                  'Login Name': testIdir,
                  'Employment Status': 'Active',
                  'Primary Organization Id': testOrgId,
                  [queryHierarchyEmployeeChildClassName]: [
                    {
                      'Organization Id': testOrgId,
                      Organization: testOrg,
                    },
                  ],
                },
              ],
            },
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        )
        .mockReturnValueOnce(
          of({
            data: {
              items: [
                {
                  [configService.get(
                    `upstreamAuth.${validRecordType}.idirField`,
                  )]: testIdir,
                },
              ],
            },
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        );
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: testIdir,
          };
          return headerVal[key];
        }),
        body: {
          docRequest:
            '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
        },
      });
      const isAuthed = await service.getRecordAndValidate(mockRequest, false);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(cacheSpy).toHaveBeenCalledTimes(5);
      expect(isAuthed).toBe(true);
    });

    it('should return true with valid record for non caseload auth in cache', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(officeNames);
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: testIdir,
          };
          return headerVal[key];
        }),
        body: {
          docRequest:
            '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
        },
      });
      const isAuthed = await service.getRecordAndValidate(mockRequest, false);
      expect(cacheSpy).toHaveBeenCalledTimes(3);
      expect(isAuthed).toBe(true);
    });

    it('should return true with valid record for caseload auth', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('');
      const spy = jest.spyOn(httpService, 'get').mockReturnValueOnce(
        of({
          data: {
            items: [
              {
                'Login Name': testIdir,
                'Employment Status': 'Active',
                'Primary Organization Id': testOrgId,
                [queryHierarchyEmployeeChildClassName]: [
                  {
                    'Organization Id': testOrgId,
                    Organization: testOrg,
                  },
                ],
              },
            ],
          },
          headers: {},
          config: {
            url: 'exampleurl',
            headers: {} as RawAxiosRequestHeaders,
          },
          status: 200,
          statusText: 'OK',
        } as AxiosResponse<any, any>),
      );
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: testIdir,
          };
          return headerVal[key];
        }),
        body: { payLoad: {} },
      });
      const isAuthed = await service.getRecordAndValidate(mockRequest, true);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(3);
      expect(isAuthed).toBe(true);
    });

    it('should return true with valid record for caseload auth in cache', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(officeNames);
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: testIdir,
          };
          return headerVal[key];
        }),
        body: { payLoad: {} },
      });
      const isAuthed = await service.getRecordAndValidate(mockRequest, true);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(isAuthed).toBe(true);
    });

    it.each([
      [403, true, officeNames, 3],
      [200, false, undefined, 3],
      [403, false, undefined, 3],
    ])(
      'should return false with invalid record in cache',
      async (
        cacheReturnRecord,
        cacheReturnEmpStatus,
        cacheReturnOfficeNames,
        cacheSpyCallTimes,
      ) => {
        const cacheSpy = jest
          .spyOn(cache, 'get')
          .mockResolvedValueOnce(cacheReturnRecord)
          .mockResolvedValueOnce(cacheReturnEmpStatus)
          .mockResolvedValueOnce(cacheReturnOfficeNames);
        const mockRequest = getMockReq({
          header: jest.fn((key: string): string => {
            const headerVal: { [key: string]: string } = {
              [idirUsernameHeader]: `notTestIdir`,
            };
            return headerVal[key];
          }),
          body: {
            docRequest: ' { "payLoad": { "incidentNumber": "1234567" } }',
          },
        });
        const isAuthed = await service.getRecordAndValidate(mockRequest, false);
        expect(cacheSpy).toHaveBeenCalledTimes(cacheSpyCallTimes);
        expect(isAuthed).toBe(false);
      },
    );

    it('should throw with upstream invalid record for record type', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(officeNames)
        .mockResolvedValueOnce('');
      const spy = jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new AxiosError('not found', '404');
      });
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: `notTestIdir`,
          };
          return headerVal[key];
        }),
        body: {
          docRequest:
            '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
        },
      });
      await expect(
        service.getRecordAndValidate(mockRequest, false),
      ).rejects.toThrow(HttpException);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(4);
    });

    it('should throw with upstream invalid record for employee', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('');
      const spy = jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new AxiosError('not found', '404');
      });
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: `notTestIdir`,
          };
          return headerVal[key];
        }),
        body: {},
      });
      await expect(
        service.getRecordAndValidate(mockRequest, true),
      ).rejects.toThrow(HttpException);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('nonCaseloadCheck tests', () => {
    it('should return false on JTI error', async () => {
      const jtiSpy = jest
        .spyOn(utilitiesService, 'grabJTI')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const mockRequest = getMockReq({
        header: jest.fn((key: string): string => {
          const headerVal: { [key: string]: string } = {
            [idirUsernameHeader]: testIdir,
          };
          return headerVal[key];
        }),
        body: {
          docRequest:
            '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
        },
      });
      const result = await service.nonCaseloadCheck(testIdir, mockRequest);
      expect(jtiSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it.each([
      [EntityType.Case, undefined],
      [undefined, '1234567'],
    ])(
      'should return false if entityNumber or type is undefined',
      async (entityType, entityNumber) => {
        const entityInfoSpy = jest
          .spyOn(utilitiesService, 'findEntityInfo')
          .mockReturnValueOnce([entityType, entityNumber]);
        const mockRequest = getMockReq({
          header: jest.fn((key: string): string => {
            const headerVal: { [key: string]: string } = {
              [idirUsernameHeader]: testIdir,
            };
            return headerVal[key];
          }),
          body: {
            docRequest:
              '{ "payLoad": { "entityType": "Case", "entityNumber": "1234567" } }',
          },
        });
        const result = await service.nonCaseloadCheck(testIdir, mockRequest);
        expect(entityInfoSpy).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
      },
    );
  });

  describe('evaluateUpstreamResult tests', () => {
    it('should return 200 if is assigned to office', async () => {
      const cacheSpy = jest.spyOn(cache, 'set');
      const upstreamResult = await service.evaluateUpstreamResult(
        true,
        testIdir,
        'cachetest1',
        'searchspec',
      );
      expect(cacheSpy).toHaveBeenCalledTimes(1);
      expect(upstreamResult).toBe(200);
    });

    it.each([
      [testIdir + 'abcd', 0],
      [undefined, 0],
    ])(
      'should return 403 if not assigned to Office',
      async (upstreamIdir, cacheSpyCallTimes) => {
        const cacheSpy = jest.spyOn(cache, 'set');
        const upstreamResult = await service.evaluateUpstreamResult(
          false,
          testIdir,
          'cachetest2' + cacheSpyCallTimes,
          'searchspec',
        );
        expect(cacheSpy).toHaveBeenCalledTimes(cacheSpyCallTimes);
        expect(upstreamResult).toBe(403);
      },
    );
  });

  describe('getIsAssignedToOfficeUpstream tests', () => {
    it.each([
      [
        validId,
        validRecordType,
        `([undefined]='id1234') AND (([undefined]='office1' OR [undefined]='office2') OR EXISTS ([testfield]='IDIRTEST') AND ([undefined]='N'))`,
      ],
      [
        validId,
        RecordType.Memo,
        `([undefined]='id1234') AND (([undefined]='office1' OR [undefined]='office2') OR ([undefined]='IDIRTEST') AND ([undefined]='N'))`,
      ],
    ])(
      'should return idir string given good input',
      async (id, recordType, searchspec) => {
        const cacheSpy = jest.spyOn(cache, 'get').mockResolvedValueOnce(' ');
        const spy = jest.spyOn(httpService, 'get').mockReturnValueOnce(
          of({
            data: {
              items: [
                {
                  [configService.get(`auth.${recordType}.searchspecIdirField`)]:
                    testIdir,
                },
              ],
            },
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        );
        const result = await service.getIsAssignedToOfficeUpstream(
          id,
          recordType,
          testIdir,
          officeNames,
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(cacheSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual([true, searchspec]);
      },
    );

    it.each([[404], [500]])(`Should throw on axios error`, async (status) => {
      const cacheSpy = jest.spyOn(cache, 'get').mockResolvedValueOnce(' ');
      const spy = jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new AxiosError(
          'Axios Error',
          status.toString(),
          {} as InternalAxiosRequestConfig,
          {},
          {
            data: {},
            status: status,
            statusText: '',
            headers: {} as RawAxiosRequestHeaders,
            config: {} as InternalAxiosRequestConfig,
          },
        );
      });
      await expect(
        service.getIsAssignedToOfficeUpstream(
          validId,
          RecordType.Case,
          'idir',
          officeNames,
        ),
      ).rejects.toThrow(HttpException);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw on token refresh error', async () => {
      const cacheSpy = jest.spyOn(cache, 'get').mockResolvedValueOnce(null);
      await expect(
        service.getIsAssignedToOfficeUpstream(
          validId,
          validRecordType,
          'idir',
          officeNames,
        ),
      ).rejects.toThrow(HttpException);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('positionCheck tests', () => {
    it('should return false on non-matching primary organization', async () => {
      const response = {
        data: {
          items: [
            {
              'Login Name': testIdir,
              'Employment Status': 'Active',
              'Primary Organization Id': testOrgId,
              [queryHierarchyEmployeeChildClassName]: [
                {
                  'Organization Id': testOrgId,
                  Organization: testOrg + 'abcd',
                },
              ],
            },
          ],
        },
      };
      const cacheSpy = jest
        .spyOn(cache, 'set')
        .mockResolvedValueOnce(undefined);
      const result = await service.positionCheck(testIdir, response);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual([false, null]);
    });

    it('should return false on primary organization not found', async () => {
      const response = {
        data: {
          items: [
            {
              'Login Name': testIdir,
              'Employment Status': 'Active',
              'Primary Organization Id': testOrgId,
              [queryHierarchyEmployeeChildClassName]: [
                {
                  'Organization Id': testOrgId + 'abcd',
                  Organization: testOrg,
                },
              ],
            },
          ],
        },
      };
      const cacheSpy = jest
        .spyOn(cache, 'set')
        .mockResolvedValueOnce(undefined);
      const result = await service.positionCheck(testIdir, response);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual([false, null]);
    });

    it('should return true if restrict to org is undefined', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          TokenRefresherService,
          {
            provide: CACHE_MANAGER,
            useValue: {
              set: () => jest.fn(),
              get: () => jest.fn(),
            },
          },
          UtilitiesService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const lookup = {
                  [`upstreamAuth.${validRecordType}.idirField`]: 'testfield',
                  [`upstreamAuth.${validRecordType}.workspace`]: 'testspace',
                  [`upstreamAuth.employee.restrictToOrg`]: undefined,
                  'recordCache.cacheTtlMs': 1000000,
                  skipJWTCache: true,
                };
                return lookup[key];
              }),
            },
          },
          { provide: HttpService, useValue: { get: jest.fn() } },
          JwtService,
        ],
      }).compile();

      service = module.get<AuthService>(AuthService);
      configService = module.get<ConfigService>(ConfigService);
      httpService = module.get<HttpService>(HttpService);
      cache = module.get(CACHE_MANAGER);
      const response = {
        data: {
          items: [
            {
              'Login Name': testIdir,
              'Employment Status': 'Active',
              'Primary Organization Id': testOrgId,
              [queryHierarchyEmployeeChildClassName]: [
                {
                  'Organization Id': testOrgId,
                  Organization: testOrg,
                },
              ],
            },
          ],
        },
      };
      const cacheSpy = jest
        .spyOn(cache, 'set')
        .mockResolvedValueOnce(undefined);
      const result = await service.positionCheck(testIdir, response);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual([true, '']);
    });
  });

  describe('getEmployeeActiveUpstream test', () => {
    it.each([[testIdir], [testIdir + 'randomstring']])(
      'should return active offices given good input',
      async (idir) => {
        const cacheSpy = jest.spyOn(cache, 'get').mockResolvedValueOnce(' ');
        const spy = jest.spyOn(httpService, 'get').mockReturnValueOnce(
          of({
            data: {
              items: [
                {
                  'Login Name': idir,
                  'Employment Status': 'Active',
                  'Primary Organization Id': testOrgId,
                  [queryHierarchyEmployeeChildClassName]: [
                    {
                      'Organization Id': testOrgId,
                      Organization: testOrg,
                      Division: 'office1',
                    },
                    {
                      'Organization Id': testOrgId,
                      Organization: testOrg,
                      Division: 'office2',
                    },
                  ],
                },
              ],
            },
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        );
        const [result, offices] =
          await service.getEmployeeActiveUpstream(testIdir);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(cacheSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(true);
        expect(offices).toBe(officeNames);
      },
    );

    it.each([[{}], [{ items: [{}] }]])(
      'should throw when employee status not in response',
      async (data) => {
        const cacheSpy = jest.spyOn(cache, 'get').mockResolvedValueOnce(' ');
        const spy = jest.spyOn(httpService, 'get').mockReturnValueOnce(
          of({
            data,
            headers: {},
            config: {
              url: 'exampleurl',
              headers: {} as RawAxiosRequestHeaders,
            },
            status: 200,
            statusText: 'OK',
          } as AxiosResponse<any, any>),
        );
        await expect(
          service.getEmployeeActiveUpstream(testIdir),
        ).rejects.toThrow(HttpException);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(cacheSpy).toHaveBeenCalledTimes(1);
      },
    );

    it.each([[404], [500]])(`Should throw on axios error`, async (status) => {
      const cacheSpy = jest.spyOn(cache, 'get').mockResolvedValueOnce(' ');
      const spy = jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new AxiosError(
          'Axios Error',
          status.toString(),
          {} as InternalAxiosRequestConfig,
          {},
          {
            data: {},
            status: status,
            statusText: '',
            headers: {} as RawAxiosRequestHeaders,
            config: {} as InternalAxiosRequestConfig,
          },
        );
      });
      await expect(service.getEmployeeActiveUpstream(testIdir)).rejects.toThrow(
        HttpException,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw on token refresh error', async () => {
      const cacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValueOnce(undefined);
      await expect(service.getEmployeeActiveUpstream(testIdir)).rejects.toThrow(
        HttpException,
      );
      expect(cacheSpy).toHaveBeenCalledTimes(1);
    });
  });
});
