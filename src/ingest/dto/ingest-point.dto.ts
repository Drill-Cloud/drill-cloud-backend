import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class IngestPointDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsNotEmpty()
  @IsString()
  tag!: string;

  @IsDateString()
  timestamp!: string;

  @Type(() => Number)
  @IsNumber()
  value!: number;
}
