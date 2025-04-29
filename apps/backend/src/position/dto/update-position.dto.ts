import { IsOptional, IsString } from 'class-validator';

export class UpdatePositionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  electionId?: string;
}
