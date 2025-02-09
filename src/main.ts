import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { setupSecurity } from './config/security.setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { TcpTransport } from './logger/tcp.transport';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger({
      transports: [
        new TcpTransport({ host: 'localhost', port: 5001 }),
        new winston.transports.Console({
          format: winston.format.json(),
        }),
      ],
    }),
  });

  const logger: Logger = new Logger('Root');
  const configService: ConfigService = app.get(ConfigService);

  const swaggerCfg: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Repo Radar')
    .setDescription('Repo Radar API Documentation')
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('docs', app, document);

  // SECURITY
  setupSecurity(app);

  const HTTP_PORT = configService.get('HTTP_PORT');

  await app.listen(HTTP_PORT);
  const url = await app.getUrl();

  logger.verbose(`Http api started on port: ${HTTP_PORT}`);
  logger.verbose(`Http api docs are available at: ${url}/docs`);
}
bootstrap();
