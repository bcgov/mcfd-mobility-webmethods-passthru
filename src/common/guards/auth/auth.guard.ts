import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isCaseload = context.getHandler().name === 'getCaseload';
    const isAuthorized = await this.authService.getRecordAndValidate(
      request,
      isCaseload,
    );
    if (isAuthorized === true) {
      this.logger.log({ msg: `Auth status: 200`, authStatusCode: 200 });
    } else {
      this.logger.log({ msg: `Auth status: 403`, authStatusCode: 403 });
    }
    return isAuthorized;
  }
}
