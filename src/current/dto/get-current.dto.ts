import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { parseCommaSeparatedList } from '../../common/query-list';

export class GetCurrentDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsOptional()
  @Transform(({ value }) => parseCommaSeparatedList(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
