import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class IngestEdgeValuesDto {
  @IsOptional()
  @IsDateString()
  time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  timestamp?: number;

  @IsObject()
  values!: Record<string, number>;
}
