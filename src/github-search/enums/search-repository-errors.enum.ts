export enum SearchRepositoriesErrorMsg {
  EMPTY_QUERY_MSG = 'query should not be empty',
  MIN_AMOUNT_OF_PAGE_MSG = 'page must not be less than 1',
  MIN_AMOUNT_OF_PER_PAGE_MSG = 'per_page must not be less than 1',
  MAX_AMOUNT_OF_PER_PAGE_MSG = 'per_page must not be greater than 100',
}
