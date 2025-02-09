import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { isObject } from 'class-validator';

import { GithubSearchApiService } from './services';
import { makeLogMessage } from '../common/util';
import { CORRELATION_HEADER_KEY } from '../common/decorators';

// 1,000 milliseconds in 1 second
const secondsToMilliseconds = (seconds: number): number => seconds * 1000;

@Module({
  imports: [HttpModule.register({ timeout: secondsToMilliseconds(10) })],
  providers: [GithubSearchApiService],
  exports: [GithubSearchApiService],
})
export class ExternalApiModule implements OnModuleInit {
  private readonly logger: Logger = new Logger(ExternalApiModule.name);

  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    const axios = this.httpService.axiosRef;

    axios.interceptors.request.use((config) => {
      config['metadata'] = { ...config['metadata'], startDate: new Date() };

      let queryParamsStr = '?';
      isObject(config.params) &&
        Object.keys(config.params).forEach((param) => {
          queryParamsStr += `${param}=${config.params[param]}&`;
        });
      queryParamsStr = queryParamsStr.slice(0, -1);

      this.logger.verbose;

      this.logger.debug(
        makeLogMessage({
          data: `[external-api][req] method:${config?.method?.toUpperCase()} url:${
            config.url
          }${queryParamsStr}`,
          correlationId: config.headers[CORRELATION_HEADER_KEY],
        }),
        ExternalApiModule.name,
      );

      return config;
    });

    axios.interceptors.response.use(
      (response) => {
        const { config } = response;
        config['metadata'] = { ...config['metadata'], endDate: new Date() };
        const duration =
          config['metadata'].endDate.getTime() -
          config['metadata'].startDate.getTime();

        let queryParamsStr = '?';
        isObject(config.params) &&
          Object.keys(config.params).forEach((param) => {
            queryParamsStr += `${param}=${config.params[param]}&`;
          });
        queryParamsStr = queryParamsStr.slice(0, -1);

        this.logger.debug(
          makeLogMessage({
            data: `[external-api][res] method:${config?.method?.toUpperCase()} url:${
              config.url
            }${queryParamsStr} ${duration}ms`,
            correlationId: config.headers[CORRELATION_HEADER_KEY],
          }),
          ExternalApiModule.name,
        );

        return response;
      },
      (err) => {
        if (err instanceof AxiosError) {
          this.logger.error(
            makeLogMessage({
              data: {
                err: err.message,
                msg: '[external-api][err]',
                url: err?.config?.url,
              },
              correlationId: err?.config?.headers[CORRELATION_HEADER_KEY],
            }),
            ExternalApiModule.name,
            err.stack,
          );
        }

        return Promise.reject(err);
      },
    );
  }
}
