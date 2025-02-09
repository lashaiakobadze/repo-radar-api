import { Injectable, Logger } from '@nestjs/common';
import { GithubSearchApiService } from '../external-api/services';
import {
  GithubRepository,
  GithubSearchResponse,
} from '../external-api/services/dto/response';
import {
  GithubSearchOrder,
  GithubSearchSort,
} from '../external-api/services/enum';

@Injectable()
export class GithubSearchService {
  private readonly logger = new Logger(GithubSearchService.name);

  constructor(
    private readonly githubSearchApiService: GithubSearchApiService,
  ) {}

  async searchRepositories(params: {
    correlationId: string;
    query: string;
    order?: GithubSearchOrder;
    sort?: GithubSearchSort;
    ignore?: string;
    page?: number;
    per_page?: number;
  }): Promise<GithubSearchResponse> {
    try {
      const { correlationId, query, order, sort, ignore, page, per_page } =
        params;

      const repos: GithubSearchResponse =
        await this.githubSearchApiService.searchRepositories({
          correlationId,
          query,
          order,
          sort,
          page,
          per_page,
        });

      let filteredItems: GithubRepository[] = repos?.items;

      if (!filteredItems.length) {
        return repos;
      }

      if (ignore) {
        if (ignore == query) {
          return {
            total_count: 0,
            incomplete_results: false,
            items: [],
          };
        }

        filteredItems = filteredItems.filter(
          (item: GithubRepository) =>
            !item.name.toLowerCase().includes(ignore.toLowerCase()),
        );
      }

      // we don't want to broke the pagination limit
      if (ignore && per_page && filteredItems.length < per_page) {
        filteredItems = await this.fetchAdditionalResults({
          correlationId,
          query,
          order,
          sort,
          ignore,
          page: (page || 1) + 1,
          per_page,
          filteredItems,
        });
      }

      return { ...repos, items: filteredItems };
    } catch (error) {
      this.logger.error(
        `Failed to process repository search: ${error.message}`,
      );
      throw new Error('Failed to process repository search');
    }
  }

  // Helper method for recursively fetching additional pages
  private async fetchAdditionalResults(params: {
    correlationId: string;
    query: string;
    order?: GithubSearchOrder;
    sort?: GithubSearchSort;
    ignore?: string;
    page: number;
    per_page: number;
    filteredItems: GithubRepository[];
  }): Promise<GithubRepository[]> {
    const {
      correlationId,
      query,
      order,
      sort,
      ignore,
      page,
      per_page,
      filteredItems,
    } = params;

    if (!filteredItems.length) return filteredItems;

    const additionalRepos: GithubSearchResponse =
      await this.githubSearchApiService.searchRepositories({
        correlationId,
        query,
        order,
        sort,
        page,
        per_page,
      });

    if (ignore) {
      const additionalFilteredItems = additionalRepos.items.filter(
        (item: GithubRepository) =>
          !item.name.toLowerCase().includes(ignore.toLowerCase()),
      );
      filteredItems.push(...additionalFilteredItems);
    }

    // If still fewer than per_page, fetch more recursively
    if (filteredItems.length < per_page) {
      return this.fetchAdditionalResults({
        correlationId,
        query,
        order,
        sort,
        ignore,
        page: page + 1,
        per_page,
        filteredItems,
      });
    }

    return filteredItems;
  }
}
