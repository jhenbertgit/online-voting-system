import { IsString, IsUUID } from 'class-validator';

export class SubmitVoteDto {
  @IsUUID()
  electionId: string;

  @IsUUID()
  positionId: string;

  @IsUUID()
  candidateId: string;

  @IsString()
  userId: string;

  @IsString()
  txHash: string;
}
