import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { RequestWithUser } from 'src/utils/types/requestWithUser';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/loginUser.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('auth')
  @ApiOperation({
    summary:
      'creates an account for the user and sends access token and refresh token as cookies',
  })
  @HttpCode(201)
  @Post('signup')
  public async signup(
    @Body() userData: CreateUserDto,
    @Req() request: Request,
  ) {
    const user = await this.authService.signup(userData);
    await this.authService.setJwtTokenCookies(user as User, request.res);
    return user;
  }

  @ApiTags('auth')
  @ApiOperation({
    summary:
      'logs in the user and sends access token and refresh token as cookies',
  })
  @ApiBody({
    type: LoginUserDto,
  })
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signin(@Req() request: RequestWithUser) {
    const { user } = request;
    await this.authService.setJwtTokenCookies(user, request.res);

    console.log(user);
    return user;
  }

  @ApiTags('auth')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'returns the current logged in user',
  })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async me(@Req() request: RequestWithUser) {
    const { user } = request;
    console.log(user);

    return user;
  }

  @ApiTags('auth')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'logs user out and clears cookies',
  })
  @Get('logout')
  @UseGuards(JwtAuthGuard)
  public logout(@Req() req: RequestWithUser) {
    return this.authService.clearJwtTokenCookies(req.res);
  }
}
