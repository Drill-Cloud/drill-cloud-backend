import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class GetHistoryDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsNotEmpty()
  @IsString()
  tag!: string;

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
