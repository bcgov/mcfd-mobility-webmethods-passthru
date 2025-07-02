import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionFilterService } from './submission-filter.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

describe('SubmissionFilterService', () => {
  let service: SubmissionFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        SubmissionFilterService,
        RequestPreparerService,
        UtilitiesService,
        TokenRefresherService,
        JwtService,
        {
          provide: HttpService,
          useValue: { post: () => jest.fn(), get: () => jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: () => jest.fn(),
            get: () => 'Bearer token',
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionFilterService>(SubmissionFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
