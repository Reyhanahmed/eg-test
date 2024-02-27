import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    // Rate limiting with ratio of 5 requests per 5 seconds
    ThrottlerModule.forRoot([
      {
        ttl: seconds(5),
        limit: 5,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: false,
          },
        },
      },
    }),
    ConfigurationModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
