import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { UsersService } from 'src/users/users.service';
import { ACCESS_TOKEN_NAME } from 'src/utils/constants/auth.constant';
import { TokenClaims } from 'src/utils/types/tokenClaims';
import { excludePrismaFields } from 'src/utils/excludePrismaFields';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.[ACCESS_TOKEN_NAME];
        },
      ]),
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenClaims) {
    return excludePrismaFields(await this.usersService.getById(payload.id), [
      'password',
      'refreshToken',
    ]);
  }
}
