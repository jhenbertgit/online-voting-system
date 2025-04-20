import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { getAuth } from '@clerk/express';
import { TxWebhookDto } from './dto/tx-webhook.dto';
import { BallotService } from './ballot.service';

@Controller('ballot')
export class BallotController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ballotService: BallotService,
  ) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  async submitVote(@Body() dto: SubmitVoteDto) {
    return this.ballotService.submitVote(dto);
  }

  @Post('webhook/tx-confirm')
  async handleTxConfirmation(@Body() body: TxWebhookDto) {
    return this.ballotService.handleTxConfirmation(body);
  }

  @Get()
  @UseGuards(ClerkAuthGuard)
  async getBallot(@Req() req: Request) {
    const { userId } = getAuth(req);

    if (!userId) throw new UnauthorizedException('Not authenticated');

    return this.ballotService.getBallot(userId);
  }
}
