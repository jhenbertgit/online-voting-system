import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { JsonRpcProvider } from 'ethers';

@Injectable()
export class BallotService {
  constructor(private prisma: PrismaService) {}

  async submitVote(dto: SubmitVoteDto) {
    // Verify vote on blockchain first
    const isValidTx = await this.verifyBlockchainTransaction(dto.txHash);
    if (!isValidTx) throw new Error('Invalid blockchain transaction');

    return this.prisma.vote.create({
      data: {
        electionId: dto.electionId,
        positionId: dto.positionId,
        candidateId: dto.candidateId,
        userId: dto.userId,
        txHash: dto.txHash,
      },
    });
  }

  private async verifyBlockchainTransaction(txHash: string) {
    const provider = new JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt?.status === 1;
  }
}
