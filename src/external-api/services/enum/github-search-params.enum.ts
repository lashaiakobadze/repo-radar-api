import { GithubSearchOrder } from './github-search-order.enum';
import { GithubSearchSort } from './github-search-sort.enum';

export interface GithubSearchParams {
  query: string;
  sort?: GithubSearchSort;
  order?: GithubSearchOrder;
  ignore?: string;
  per_page?: number;
  page?: number;
  correlationId: string;
}
