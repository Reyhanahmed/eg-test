import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as brycpt from 'bcrypt';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import {
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_NAME,
} from 'src/utils/constants/auth.constant';
import { TokenClaims, TokenData } from 'src/utils/types/tokenClaims';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Wrong credentials provided');
    }
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string) {
    const isPasswordMatching = await brycpt.compare(
      plainPassword,
      hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Wrong credentials provided');
    }
  }

  async signup(userData: CreateUserDto) {
    // TODO: check for password requirements
    const saltRounds = 10;
    const hashedPassword = await brycpt.hash(userData.password, saltRounds);

    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    return user;
  }

  async setJwtTokenCookies(user: User, response: Response) {
    const claims = { id: user.id, email: user.email };

    await this.generateAndSaveAccessToken(claims, response);
    await this.generateAndSaveRefreshToken(claims, response);
  }

  async generateAndSaveAccessToken(claims: TokenData, response: Response) {
    const token = this.jwtService.sign(claims);
    response.cookie(ACCESS_TOKEN_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: this.configService.get(
        'ACCESS_TOKEN_EXPIRATION_TIME_MILLISECONDS',
      ),
    });
    return token;
  }

  async generateAndSaveRefreshToken(claims: TokenData, response: Response) {
    const expirationTimeInMilliseconds = this.configService.get(
      'REFRESH_TOKEN_EXPIRATION_TIME_MILLISECONDS',
    );
    const token = this.jwtService.sign(claims, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      // convert into seconds, since jsonwebtoken library expects in seconds
      // set the expiry to 1 day
      expiresIn: expirationTimeInMilliseconds / 1000,
    });

    await this.usersService.update(claims.id, {
      refreshToken: token,
    });

    response.cookie(REFRESH_TOKEN_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: expirationTimeInMilliseconds,
    });
  }

  public validateAccessToken(token: string): TokenClaims {
    return this.jwtService.verify(token, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
    });
  }

  public validateRefreshToken(token: string): TokenClaims {
    return this.jwtService.verify(token, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });
  }

  public clearJwtTokenCookies(res: Response) {
    res.clearCookie(ACCESS_TOKEN_NAME);
    res.clearCookie(REFRESH_TOKEN_NAME);
  }
}
