import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  authIdirHeaderName,
  CHILD_LINKS,
  CONTENT_TYPE,
  idirUsernameHeader,
  UNIFORM_RESPONSE,
  uniformResponseParamName,
  VIEW_MODE,
} from '../../common/constants/parameter-constants';
import { TokenRefresherService } from '../token-refresher/token-refresher.service';

@Injectable()
export class RequestPreparerService {
  buildNumber: string;
  authString: string;
  private readonly logger = new Logger(RequestPreparerService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly tokenRefresherService: TokenRefresherService,
  ) {
    this.buildNumber = this.configService.get<string>('buildInfo.buildNumber');
    this.authString = this.configService.get<string>('auth.authInfo');
  }

  prepareHeadersAndParams(
    baseSearchSpec: string,
    workspace: string | undefined,
    uniformResponse: boolean,
    idir: string,
  ) {
    let searchSpec = baseSearchSpec;
    searchSpec = searchSpec + `)`;
    if (baseSearchSpec === '') {
      searchSpec = searchSpec.replace(')', '').replace(' AND ', '');
    }
    const params = {
      ViewMode: VIEW_MODE,
      ChildLinks: CHILD_LINKS,
      searchspec: searchSpec,
    };
    if (uniformResponse === true) {
      params[uniformResponseParamName] = UNIFORM_RESPONSE;
    }
    if (typeof workspace !== 'undefined' && workspace.trim() !== '') {
      params['workspace'] = workspace;
    }
    const headers = {
      Accept: CONTENT_TYPE,
      'Accept-Encoding': '*',
      [authIdirHeaderName]: idir,
    };
    return [headers, params];
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

  async sendGetRequest(url: string, headers, params?) {
    let response;
    try {
      const token =
        await this.tokenRefresherService.refreshUpstreamBearerToken();
      if (token === undefined) {
        throw new Error('Upstream auth failed');
      }
      headers['Authorization'] = token;
      response = await firstValueFrom(
        this.httpService.get(url, { params, headers }),
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
      } else {
        this.logger.error({ error, buildNumber: this.buildNumber });
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            error.response?.data !== undefined
              ? error.response?.data
              : error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
    return response;
  }
}
