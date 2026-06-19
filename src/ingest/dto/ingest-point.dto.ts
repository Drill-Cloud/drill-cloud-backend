import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class IngestPointDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsNotEmpty()
  @IsString()
  tag!: string;

  @IsOptional()
  @IsDateString()
  time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  timestamp?: number;

  @Type(() => Number)
  @IsNumber()
  value!: number;
}
