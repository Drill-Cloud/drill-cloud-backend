import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { normalizeOptionalText } from '../../common/normalize-text';

export class GetEdgesDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  parentId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  search?: string;
}
