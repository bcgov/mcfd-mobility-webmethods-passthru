import { Test, TestingModule } from '@nestjs/testing';
import { UtilitiesService } from './utilities.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getMockReq } from '@jest-mock/express';

describe('UtilitiesService', () => {
  let service: UtilitiesService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilitiesService,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const lookup = {
                skipJWTCache: false,
              };
              return lookup[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UtilitiesService>(UtilitiesService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('grabJTI tests', () => {
    it.each([[`cd529a83c49099f722bfb3e1f31fa01b`]])(
      `should return jti on valid jwt`,
      (jti) => {
        const jwt = jwtService.sign(`{"jti":"${jti}"}`, {
          secret: 'aTotalSecret',
        });
        const req = getMockReq({
          header: jest.fn((headerName) => {
            const lookup = { authorization: `Bearer ${jwt}` };
            return lookup[headerName];
          }),
        });
        expect(service.grabJTI(req)).toEqual(jti);
      },
    );

    it(`should return local when skipping jwt`, async () => {
      const localModule = await Test.createTestingModule({
        providers: [
          UtilitiesService,
          JwtService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const lookup = {
                  skipJWTCache: true,
                };
                return lookup[key];
              }),
            },
          },
        ],
      }).compile();

      const localService = localModule.get<UtilitiesService>(UtilitiesService);
      const req = getMockReq();
      expect(localService.grabJTI(req)).toEqual('local');
    });

    it.each([['invalidJWT']])(`should throw error on invalid JWT`, (jwt) => {
      const req = getMockReq({
        header: jest.fn((headerName) => {
          const lookup = { authorization: `Bearer ${jwt}` };
          return lookup[headerName];
        }),
      });
      expect(() => {
        service.grabJTI(req);
      }).toThrow(`Invalid JWT`);
    });
  });
});
