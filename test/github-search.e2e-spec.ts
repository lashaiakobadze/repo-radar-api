import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import { GithubSearchApiService } from '../src/external-api/services';
import { createMockGithubRepository } from './utils/mock-data.util';
import { TcpTransport } from '../src/logger/tcp.transport';
import { SearchRepositoriesErrorMsg } from '../src/github-search/enums/search-repository-errors.enum';
import { GithubRepository } from '../src/external-api/services/dto/response';
import { GithubSearchOrder } from '../src/external-api/services/enum';

describe('GithubSearchController (e2e)', () => {
  let app: INestApplication;
  let githubSearchApiService: GithubSearchApiService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GithubSearchApiService)
      .useValue({
        searchRepositories: jest.fn(),
      })
      .overrideProvider(TcpTransport)
      .useValue({
        connect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    githubSearchApiService = moduleFixture.get<GithubSearchApiService>(
      GithubSearchApiService,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe.only('GET /github-search/search', () => {
    it('should successfully search GitHub repositories with valid parameters', async () => {
      const mockRepo: GithubRepository = createMockGithubRepository({
        name: 'mock-repo',
        stargazers_count: 1234,
      });

      jest
        .spyOn(githubSearchApiService, 'searchRepositories')
        .mockResolvedValue({
          total_count: 100,
          incomplete_results: false,
          items: [mockRepo],
        });

      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nestjs', per_page: 30, page: 1 });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.total_count).toBe(100);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0]).toHaveProperty('name');
      expect(response.body.items[0].name).toBe(mockRepo.name);
    });

    it('should return an error when the page parameter is invalid', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nestjs', per_page: 30, page: -1 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toEqual([
        SearchRepositoriesErrorMsg.MIN_AMOUNT_OF_PAGE_MSG,
      ]);
    });

    it('should return an error when the per_page parameter is invalid', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nestjs', per_page: -1, page: 10 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toEqual([
        SearchRepositoriesErrorMsg.MIN_AMOUNT_OF_PER_PAGE_MSG,
      ]);
    });

    it('should return an error when per_page exceeds the maximum limit', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nestjs', per_page: 101, page: 1 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toEqual([
        SearchRepositoriesErrorMsg.MAX_AMOUNT_OF_PER_PAGE_MSG,
      ]);
    });

    it('should return the correct repositories on the second page', async () => {
      const mockRepo: GithubRepository = createMockGithubRepository({
        name: 'mock-repo',
        stargazers_count: 1234,
      });

      jest
        .spyOn(githubSearchApiService, 'searchRepositories')
        .mockResolvedValue({
          total_count: 100,
          incomplete_results: false,
          items: [mockRepo],
        });

      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nestjs', per_page: 30, page: 2 });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should return an empty list when no repositories match the query', async () => {
      createMockGithubRepository({
        name: 'mock-repo',
        stargazers_count: 1234,
      });

      jest
        .spyOn(githubSearchApiService, 'searchRepositories')
        .mockResolvedValue({
          total_count: 0,
          incomplete_results: false,
          items: [],
        });

      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nonexistent-repo', per_page: 30, page: 1 });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.items.length).toBe(0);
    });

    it('should return an ASC order when the order parameter is set to asc', async () => {
      const mockRepo1: GithubRepository = createMockGithubRepository({
        name: 'A-mock-repo',
        stargazers_count: 1234,
      });

      const mockRepo2: GithubRepository = createMockGithubRepository({
        name: 'B-mock-repo',
        stargazers_count: 1234,
      });

      jest
        .spyOn(githubSearchApiService, 'searchRepositories')
        .mockResolvedValue({
          total_count: 100,
          incomplete_results: false,
          items: [mockRepo1, mockRepo2],
        });

      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({
          query: 'nestjs',
          per_page: 30,
          page: 1,
          order: GithubSearchOrder.ASC,
        });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].name).toBe(mockRepo1.name);
      expect(response.body.items[1].name).toBe(mockRepo2.name);
    });

    it('should return a DESC order when the order parameter is set to desc', async () => {
      const mockRepo1: GithubRepository = createMockGithubRepository({
        name: 'A-mock-repo',
        stargazers_count: 1234,
      });

      const mockRepo2: GithubRepository = createMockGithubRepository({
        name: 'A-mock-repo',
        stargazers_count: 1234,
      });

      jest
        .spyOn(githubSearchApiService, 'searchRepositories')
        .mockResolvedValue({
          total_count: 100,
          incomplete_results: false,
          items: [mockRepo2, mockRepo1],
        });

      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({
          query: 'nestjs',
          per_page: 30,
          page: 1,
          order: GithubSearchOrder.DESC,
        });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].name).toBe(mockRepo2.name);
      expect(response.body.items[1].name).toBe(mockRepo1.name);
    });

    it('should ignore repositories with the word "test" in their name', async () => {
      const mockRepo1: GithubRepository = createMockGithubRepository({
        name: 'nestjs-repo',
        stargazers_count: 1234,
      });

      const mockRepo2: GithubRepository = createMockGithubRepository({
        name: 'ignore-repo',
        stargazers_count: 1234,
      });

      const mockRepo3: GithubRepository = createMockGithubRepository({
        name: 'nestjs-repo',
        stargazers_count: 1234,
      });

      const mockRepo4: GithubRepository = createMockGithubRepository({
        name: 'nestjs-repo-2',
        stargazers_count: 1234,
      });

      jest
        .spyOn(githubSearchApiService, 'searchRepositories')
        .mockResolvedValue({
          total_count: 100,
          incomplete_results: false,
          items: [mockRepo2, mockRepo1, mockRepo3, mockRepo4],
        });

      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({
          query: 'nestjs',
          per_page: 2,
          page: 1,
          order: GithubSearchOrder.DESC,
          ignore: 'ignore',
        });

      expect(response.status).toBe(HttpStatus.OK);
      expect(
        response.body.items.every(
          (item: GithubRepository) => !item.name.includes('ignore'),
        ),
      ).toBe(true);
    });

    it('should return an empty list when the query is the same as the ignore parameter', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/github-search/search')
        .query({ query: 'nestjs', ignore: 'nestjs' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        total_count: 0,
        incomplete_results: false,
        items: [],
      });
    });
  });
});
