import { GithubRepository } from '../../src/external-api/services/dto/response';

export const createMockGithubRepository = (
  overrides: Partial<GithubRepository> = {},
): GithubRepository => {
  return {
    id: 1,
    name: 'nestjs',
    full_name: 'nestjs/nest',
    owner: {
      login: 'nestjs',
      id: 1,
      avatar_url: 'https://avatars.githubusercontent.com/u/21328961?v=4',
      html_url: 'https://github.com/nestjs',
    },
    html_url: 'https://github.com/nestjs/nest',
    description:
      'A progressive Node.js framework for building efficient and scalable server-side applications.',
    fork: false,
    created_at: '2017-08-10T14:00:00Z',
    updated_at: '2023-02-06T14:00:00Z',
    pushed_at: '2023-02-06T14:00:00Z',
    stargazers_count: 20000,
    watchers_count: 20000,
    language: 'TypeScript',
    forks_count: 5000,
    open_issues_count: 50,
    default_branch: 'main',
    ...overrides,
  };
};
