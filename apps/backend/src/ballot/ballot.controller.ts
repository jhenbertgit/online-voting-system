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
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { getAuth } from '@clerk/express';
import { TxWebhookDto } from './dto/tx-webhook.dto';
import { BallotService } from './ballot.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('ballot')
@Controller('ballot')
export class BallotController {
  constructor(private readonly ballotService: BallotService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Submit a vote' })
  @ApiBody({ type: SubmitVoteDto })
  @ApiResponse({ status: 201, description: 'Vote submitted successfully.' })
  async submitVote(@Body() submitVoteDto: SubmitVoteDto) {
    return this.ballotService.submitVote(submitVoteDto);
  }

  @Post('webhook/tx-confirm')
  @ApiOperation({ summary: 'Handle transaction confirmation webhook' })
  @ApiBody({ type: TxWebhookDto })
  @ApiResponse({ status: 200, description: 'Transaction confirmation webhook processed.' })
  async handleTxConfirmation(@Body() txWebhookDto: TxWebhookDto) {
    return this.ballotService.handleTxConfirmation(txWebhookDto);
  }

  @Get()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get ballot' })
  @ApiResponse({ status: 200, description: 'Ballot retrieved successfully.' })
  async getBallot(@Req() req: Request) {
    const { userId } = getAuth(req);

    if (!userId) throw new UnauthorizedException('Not authenticated');

    return this.ballotService.getBallot(userId);
  }
}
