import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ACCESS_TOKEN_NAME } from './utils/constants/auth.constant';
import { ValidationPipe } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CLIENT_ORIGIN'),
    credentials: true, // tells browser whether server allows HTTP requests to include credentials
  });
  app.setGlobalPrefix('/api');
  // used to enable validating DTO's
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useLogger(app.get(Logger));

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const config = new DocumentBuilder()
    .setTitle('eg-test API')
    .setDescription('The API documentation for eg-test')
    .setVersion('1.0')
    .addTag('requests')
    .addCookieAuth(ACCESS_TOKEN_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use(helmet());
  app.use(cookieParser());

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
