import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenRefresherModule } from '../../../external-api/token-refresher/token-refresher.module';
import { TokenRefresherService } from '../../../external-api/token-refresher/token-refresher.service';
import { UtilitiesModule } from '../../../helpers/utilities/utilities.module';
import { UtilitiesService } from '../../../helpers/utilities/utilities.service';
import { AuthService } from './auth.service';

@Module({
  providers: [
    TokenRefresherService,
    AuthService,
    UtilitiesService,
    ConfigService,
  ],
  imports: [UtilitiesModule, HttpModule, TokenRefresherModule],
  exports: [AuthService],
})
export class AuthModule {}
