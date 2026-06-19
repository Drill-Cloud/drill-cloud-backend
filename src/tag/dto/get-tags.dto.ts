import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { normalizeOptionalText } from '../../common/normalize-text';

export class GetTagsDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  edge?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  search?: string;
}
