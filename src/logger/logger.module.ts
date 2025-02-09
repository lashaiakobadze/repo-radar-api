import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { TcpTransport } from './tcp.transport';
import { LoggerMiddleware } from '../middleware';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new TcpTransport({
          host: 'localhost',
          port: 5001,
        }),
        new winston.transports.Console({
          format: winston.format.json(),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
