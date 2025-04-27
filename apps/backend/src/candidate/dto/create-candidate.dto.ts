import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  party?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

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
