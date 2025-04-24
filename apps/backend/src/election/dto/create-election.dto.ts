import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEthereumAddress,
  IsHexadecimal,
  Length,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  onChainElectionId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsHexadecimal()
  @Length(66, 66) // 0x prefix + 64 hex characters
  merkleRoot: string;

  @IsEthereumAddress()
  contractAddress: string;

  @IsEthereumAddress()
  adminAddress: string;
}
