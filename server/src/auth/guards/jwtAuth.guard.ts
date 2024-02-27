import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import {
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_NAME,
} from 'src/utils/constants/auth.constant';
import { AuthService } from '../auth.service';
import { TokenClaims } from 'src/utils/types/tokenClaims';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpCtx = context.switchToHttp();
    const request: Request = httpCtx.getRequest();
    const response: Response = httpCtx.getResponse();

    const accessToken = ExtractJwt.fromExtractors([
      (request: Request) => {
        return request?.cookies?.[ACCESS_TOKEN_NAME];
      },
    ])(request);

    let decodedAccessToken: TokenClaims;
    let decodedRefreshToken: TokenClaims;
    try {
      decodedAccessToken = this.authService.validateAccessToken(accessToken);
    } catch (error) {}

    // check if access token is intact and has not expired
    const isAccessTokenValid =
      Boolean(decodedAccessToken) && decodedAccessToken.exp > Date.now() / 1000;

    // if access token is valid then proceed to route handler
    if (isAccessTokenValid) {
      return this.activate(context);
    }

    // if access token has expired, then get new access token using refresh token
    const refreshToken = ExtractJwt.fromExtractors([
      (request: Request) => {
        return request?.cookies?.[REFRESH_TOKEN_NAME];
      },
    ])(request);

    try {
      decodedRefreshToken = this.authService.validateRefreshToken(refreshToken);
    } catch (error) {}

    if (!Boolean(decodedRefreshToken)) throw new UnauthorizedException();

    const savedRefreshToken = (
      await this.usersService.getById(decodedRefreshToken?.id)
    )?.refreshToken;

    // check if valid refresh token, as well as expiry and is the same token saved in DB
    const isRefreshTokenValid =
      Boolean(refreshToken) &&
      decodedRefreshToken.exp > Date.now() / 1000 &&
      savedRefreshToken === refreshToken;

    if (!isRefreshTokenValid) throw new UnauthorizedException();

    const token = await this.authService.generateAndSaveAccessToken(
      {
        id: decodedRefreshToken.id,
        email: decodedRefreshToken.email,
      },
      response,
    );

    request.cookies[ACCESS_TOKEN_NAME] = token;

    return this.activate(context);
  }
  async activate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }
}
