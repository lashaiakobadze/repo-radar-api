import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  GithubSearchOrder,
  GithubSearchSort,
} from '../../external-api/services/enum';

export class SearchRepositoriesDto {
  @ApiProperty({ description: 'Search query string', example: 'nestjs' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ enum: GithubSearchOrder, description: 'Sort order' })
  @IsOptional()
  @IsEnum(GithubSearchOrder)
  order?: GithubSearchOrder;

  @ApiPropertyOptional({ description: 'Ignore repositories with this keyword' })
  @IsOptional()
  @IsString()
  ignore?: string;

  @ApiPropertyOptional({ enum: GithubSearchSort, description: 'Sort field' })
  @IsOptional()
  @IsEnum(GithubSearchSort)
  sort?: GithubSearchSort;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Results per page', example: 30 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  per_page?: number;
}
