import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { HttpStatusCode } from '../../common/enums/http-status-codes.enum';
import { CORRELATION_HEADER_KEY } from '../../common/decorators';
import { GithubSearchResponse } from './dto/response';
import { GithubSearchParams } from './enum';

@Injectable()
export class GithubSearchApiService {
  private readonly logger = new Logger(GithubSearchApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Searches repositories on GitHub based on the provided parameters.
   * @param params GithubSearchParams - The search parameters of type.
   * @returns A promise that resolves to the search response.
   * @throws Error if the search fails or encounters an error.
   */
  async searchRepositories(
    params: GithubSearchParams,
  ): Promise<GithubSearchResponse> {
    const { query, sort, order, per_page, page, correlationId } = params;

    try {
      const requestParams = {
        q: query,
        ...(sort && { sort }),
        ...(order && { order }),
        ...(per_page && { per_page }),
        ...(page && { page }),
      };

      const $source = this.httpService.get(
        `${this.configService.get('GITHUB_API_HOST')}/search/repositories`,
        {
          params: requestParams,
          headers: { [CORRELATION_HEADER_KEY]: correlationId },
        },
      );

      const { data }: AxiosResponse<GithubSearchResponse> =
        await lastValueFrom($source);

      return data;
    } catch (error) {
      this.logger.error(`Failed to search repositories: ${error.message}`);

      if (error?.response) {
        switch (error.response.status) {
          case HttpStatusCode.NOT_MODIFIED:
            throw new Error('GitHub API: Not Modified');
          case HttpStatusCode.UNPROCESSABLE_ENTITY:
            throw new Error('GitHub API: Invalid Request (422)');
          case HttpStatusCode.SERVICE_UNAVAILABLE:
            throw new Error('GitHub API: Service Unavailable (503)');
          default:
            throw new Error(`GitHub API Error: ${error.message}`);
        }
      }

      throw new Error('Failed to fetch repositories from GitHub API');
    }
  }
}
