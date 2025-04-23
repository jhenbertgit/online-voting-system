import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEthereumAddress,
  IsHexadecimal,
  Length,
} from 'class-validator';

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  onChainElectionId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsHexadecimal()
  @Length(32, 32)
  merkleRoot: string;

  @IsEthereumAddress()
  contractAddress: string;

  @IsEthereumAddress()
  adminAddress: string;
}
