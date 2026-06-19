import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { parseCommaSeparatedList } from '../../common/query-list';

export class GetHistoryDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsOptional()
  @Transform(({ value }) => parseCommaSeparatedList(value))
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(5000)
  targetPoints?: number;
}
