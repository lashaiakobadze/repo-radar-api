import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GithubSearchModule } from './github-search/github-search.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    GithubSearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
