import {
  IsString,
  IsUUID,
  IsHexadecimal,
  Length,
  IsOptional,
  IsEthereumAddress,
} from 'class-validator';

export class SubmitVoteDto {
  @IsUUID()
  electionId: string;

  @IsUUID()
  positionId: string;

  @IsUUID()
  candidateId: string;

  @IsString()
  userId: string;

  @IsHexadecimal()
  @Length(66, 66)
  candidateHash: string;

  @IsHexadecimal()
  @Length(66, 66)
  voterCommitment: string;

  @IsEthereumAddress()
  @IsOptional()
  txHash?: string;
}
