import { ConfigModule } from '@nestjs/config';

import { validate } from './env.validation';
import { Module } from '@nestjs/common';

const ENV = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV === 'development' ? '.env' : '.env.production',
      validate,
      isGlobal: true,
    }),
  ],
})
export class ConfigurationModule {}
