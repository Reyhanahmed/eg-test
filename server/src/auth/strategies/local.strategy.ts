import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { excludePrismaFields } from 'src/utils/excludePrismaFields';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    return excludePrismaFields(
      await this.authService.getAuthenticatedUser(email, password),
      ['password', 'refreshToken'],
    );
  }
}
