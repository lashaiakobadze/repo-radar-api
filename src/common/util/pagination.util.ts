import { isInt } from 'class-validator';

export interface PaginationInterface {
  skip: number;
  take: number;
}

export const pagination = (params: {
  page: number;
  per_page: number;
}): PaginationInterface => {
  const { page, per_page } = params;

  if (!isInt(page) || !isInt(per_page)) {
    throw new Error('Page and Limit should be integer');
  }

  if (page < 1) {
    throw new Error('Page should be >= 1');
  }

  if (per_page < 1) {
    throw new Error('Limit should be >= 1');
  }

  const skip = (page - 1) * per_page;
  const take = per_page;

  return {
    skip,
    take,
  };
};
