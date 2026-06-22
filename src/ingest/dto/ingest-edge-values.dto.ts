import { IsDateString, IsObject } from 'class-validator';

export class IngestEdgeValuesDto {
  @IsDateString()
  timestamp!: string;

  @IsObject()
  values!: Record<string, number>;
}
