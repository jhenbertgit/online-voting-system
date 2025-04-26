import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsNotEmpty()
  idHash: string;

  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsNotEmpty()
  electionId: string;
}
