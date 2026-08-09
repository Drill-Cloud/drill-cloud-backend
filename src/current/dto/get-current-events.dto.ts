import { IsOptional, IsString } from 'class-validator';
import { GetCurrentDto } from './get-current.dto';

export class GetCurrentEventsDto extends GetCurrentDto {
  @IsOptional()
  @IsString()
  access_token?: string;
}
