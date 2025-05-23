import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  electionId: string;
}
