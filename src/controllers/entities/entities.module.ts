import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RequestPreparerService } from '../../external-api/request-preparer/request-preparer.service';
import { HelpersModule } from '../../helpers/helpers.module';
import { AuthModule } from '../../common/guards/auth/auth.module';
import { TokenRefresherService } from '../../external-api/token-refresher/token-refresher.service';

@Module({
  imports: [HttpModule, HelpersModule, AuthModule],
  providers: [
    EntitiesService,
    ConfigService,
    RequestPreparerService,
    TokenRefresherService,
  ],
  controllers: [EntitiesController],
})
export class EntitiesModule {}
