import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsController } from './attachments.controller';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../configuration/configuration';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { AttachmentsService } from './attachments.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../../common/guards/auth/auth.service';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';
import { UtilitiesService } from '../../helpers/utilities/utilities.service';

describe('AttachmentsController', () => {
  let controller: AttachmentsController;
  let service: AttachmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        JwtModule.register({ global: true }),
      ],
      providers: [
        TokenRefresherService,
        { provide: CACHE_MANAGER, useValue: {} },
        UtilitiesService,
        AuthService,
        AttachmentsService,
        { provide: HttpService, useValue: { post: jest.fn() } },
        ConfigService,
        RequestPreparerService,
      ],
      controllers: [AttachmentsController],
    }).compile();

    controller = module.get<AttachmentsController>(AttachmentsController);
    service = module.get<AttachmentsService>(AttachmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitAttachment tests', () => {
    it('should return from the service', async () => {
      const mockResult = { data: 'here' };
      const serviceSpy = jest
        .spyOn(service, 'submitAttachment')
        .mockResolvedValueOnce(mockResult);
      const body = { body: 'here' };
      const headers = { headers: 'headers' };

      const result = await controller.submitAttachment(body, headers);
      expect(serviceSpy).toHaveBeenCalledWith(body, headers);
      expect(result).toEqual(mockResult);
    });
  });
});
