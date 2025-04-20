import { IsUUID, IsHexadecimal, Length } from 'class-validator';

export class TxWebhookDto {
  @IsUUID()
  voteId: string;

  @IsHexadecimal()
  @Length(32, 32)
  txHash: string;
}
