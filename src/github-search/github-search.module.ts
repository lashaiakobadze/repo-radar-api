import { Module } from '@nestjs/common';
import { GithubSearchController } from './github-search.controller';
import { GithubSearchService } from './github-search.service';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [ExternalApiModule],
  controllers: [GithubSearchController],
  providers: [GithubSearchService],
  exports: [GithubSearchService],
})
export class GithubSearchModule {}
