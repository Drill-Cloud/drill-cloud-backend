import { IsNotEmpty, IsString } from 'class-validator';

export class GetCamerasDto {
  @IsNotEmpty()
  @IsString()
  edge!: string;
}
