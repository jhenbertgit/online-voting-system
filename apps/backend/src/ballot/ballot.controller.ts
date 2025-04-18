import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Controller('ballot')
export class BallotController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  async submitVote(@Body() dto: SubmitVoteDto) {
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
}
