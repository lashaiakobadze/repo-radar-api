import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GithubSearchService } from './github-search.service';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { GithubSearchResponse } from '../external-api/services/dto/response';
import { SearchRepositoriesDto } from './dto/search-repository.dto';

@ApiTags('GitHub Search')
@Controller('github-search')
@ApiExtraModels(SearchRepositoriesDto)
export class GithubSearchController {
  constructor(private readonly githubService: GithubSearchService) {}

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchRepositories(
    @Query() queryParams: SearchRepositoriesDto,
  ): Promise<GithubSearchResponse> {
    return this.githubService.searchRepositories({
      correlationId: 'test-correlationId',
      ...queryParams,
    });
  }
}
