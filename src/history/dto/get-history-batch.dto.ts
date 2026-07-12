import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class GetHistoryBatchDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsNotEmpty()
  @IsString()
  tags!: string;

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

