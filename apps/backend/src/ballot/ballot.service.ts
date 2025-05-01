/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { TxWebhookDto } from './dto/tx-webhook.dto';
import { VotingGuardianABI } from '../util';

@Injectable()
export class BallotService {
  private contract: ethers.Contract;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const provider = new ethers.JsonRpcProvider(
      this.config.get('POLYGON_RPC_URL'),
    );
    this.contract = new ethers.Contract(
      this.config.get('VOTING_CONTRACT_ADDRESS') as string,
      VotingGuardianABI,
      provider,
    );
  }

  async submitVote(dto: SubmitVoteDto) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Validate candidate hash
      const candidate = await prisma.candidate.findUnique({
        where: { onChainCandidateId: dto.candidateHash },
      });

      if (!candidate) {
        throw new ConflictException('Invalid candidate hash');
      }

      // 2. Check existing vote commitment
      const existingVote = await prisma.vote.findFirst({
        where: {
          electionId: dto.electionId,
          voterCommitment: dto.voterCommitment,
        },
      });

      if (existingVote) {
        throw new ConflictException('Vote commitment already used');
      }

      // 3. Verify on-chain state
      const isCommitmentSpent = await this.contract.spentCommitments(
        dto.electionId,
        dto.voterCommitment,
      );

      if (isCommitmentSpent) {
        throw new ConflictException('Vote already recorded on blockchain');
      }

      // 4. Create database record
      const vote = await prisma.vote.create({
        data: {
          electionId: dto.electionId,
          positionId: candidate.positionId,
          candidateId: candidate.id,
          candidateHash: dto.candidateHash,
          userId: dto.userId,
          voterCommitment: dto.voterCommitment,
          txHash: dto.txHash,
        },
        include: {
          election: true,
          candidate: true,
        },
      });

      // 5. Post-creation validation
      if (vote.election.onChainElectionId) {
        const chainVote = await this.contract.queryFilter(
          this.contract.filters.VoteCast(
            vote.election.onChainElectionId,
            vote.voterCommitment,
          ),
        );

        if (!chainVote.length) {
          throw new ConflictException('Vote not found on blockchain');
        }
      }

      return vote;
    });
  }

  async getBallot(userId: string) {
    return this.prisma.vote.findMany({
      where: {
        userId,
      },
      include: {
        election: true,
        candidate: true,
      },
    });
  }

  async handleTxConfirmation(body: TxWebhookDto) {
    return this.prisma.vote.update({
      where: { id: body.voteId },
      data: { txHash: body.txHash },
    });
  }
}
