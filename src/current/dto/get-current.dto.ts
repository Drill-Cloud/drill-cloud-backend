import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetCurrentDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
