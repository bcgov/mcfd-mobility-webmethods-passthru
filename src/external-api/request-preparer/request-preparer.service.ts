import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { idirUsernameHeader } from '../../common/constants/parameter-constants';

@Injectable()
export class RequestPreparerService {
  buildNumber: string;
  authString: string;
  private readonly logger = new Logger(RequestPreparerService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.buildNumber = this.configService.get<string>('buildInfo.buildNumber');
    this.authString = this.configService.get<string>('auth.authInfo');
  }

  async sendPostRequest(url: string, body, headers) {
    let response;
    const upstreamHeaders = {
      'Content-Type': headers['content-type'],
      Authorization: this.authString,
      Accept: headers['accept'],
      [idirUsernameHeader]: headers[idirUsernameHeader.toLowerCase()],
    };
    try {
      response = await firstValueFrom(
        this.httpService.post(url, body, { headers: upstreamHeaders }),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error({
          msg: error.message,
          errorDetails: error.response?.data,
          stack: error.stack,
          cause: error.cause,
          buildNumber: this.buildNumber,
        });
        throw error;
      } else {
        this.logger.error({ error, buildNumber: this.buildNumber });
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
    return response.data;
  }
}
