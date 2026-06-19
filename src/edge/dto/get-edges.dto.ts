import { IsOptional, IsString } from 'class-validator';

export class GetEdgesDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
