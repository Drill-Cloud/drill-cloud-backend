import { IsOptional, IsString } from 'class-validator';

export class GetTagsDto {
  @IsOptional()
  @IsString()
  edge?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
