import { IsOptional, IsString } from 'class-validator';

export class GetTagsDto {
  @IsOptional()
  @IsString()
  search?: string;
}
