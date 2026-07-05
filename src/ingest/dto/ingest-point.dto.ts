import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { IsNullableNumber } from '../../common/is-nullable-number.decorator';

export class IngestPointDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;

  @IsNotEmpty()
  @IsString()
  tag!: string;

  @IsDateString()
  timestamp!: string;

  @IsNullableNumber()
  value!: number | null;
}
