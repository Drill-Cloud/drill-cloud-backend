import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === 'string') {
    return [value];
  }

  return [];
}

export class GetHistoryBatchDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags!: string[];

  @IsNotEmpty()
  @IsDateString()
  from!: string;

  @IsNotEmpty()
  @IsDateString()
  to!: string;

  @IsNotEmpty()
  @IsString()
  granulate!: string;
}
