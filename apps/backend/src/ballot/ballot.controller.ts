import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { getAuth } from '@clerk/express';
import { TxWebhookDto } from './dto/tx-webhook.dto';
import { BallotService } from './ballot.service';
import { SessionCacheService } from '../services/sessionCache.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types';

@ApiTags('ballot')
@Controller('ballot')
export class BallotController {
  constructor(
    private readonly ballotService: BallotService,
    private readonly sessionCache: SessionCacheService,
  ) {}

  @Post()
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Submit a vote' })
  @ApiBody({ type: SubmitVoteDto })
  @ApiResponse({ status: 201, description: 'Vote submitted successfully.' })
  async submitVote(@Body() submitVoteDto: SubmitVoteDto) {
    return this.ballotService.submitVote(submitVoteDto);
  }

  @Post('webhook/tx-confirm')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @ApiOperation({ summary: 'Handle transaction confirmation webhook' })
  @ApiBody({ type: TxWebhookDto })
  @ApiResponse({ status: 200, description: 'Transaction confirmed.' })
  async handleTxConfirmation(@Body() txWebhookDto: TxWebhookDto) {
    return this.ballotService.handleTxConfirmation(txWebhookDto);
  }

  @Get()
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Get ballot' })
  @ApiResponse({ status: 200, description: 'Ballot retrieved successfully.' })
  async getBallot(@Req() req: Request) {
    const { userId } = getAuth(req);

    if (!userId) throw new UnauthorizedException('Not authenticated');

    return this.ballotService.getBallot(userId);
  }

  @Post('cache')
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Cache ballot progress in Redis' })
  @ApiBody({ schema: { example: { userId: 'uuid', ballot: {} } } })
  @ApiResponse({ status: 200, description: 'Ballot cached.' })
  async cacheBallot(@Body() body: { userId: string; ballot: unknown }) {
    const { userId, ballot } = body;
    if (!userId) throw new UnauthorizedException('Missing userId');
    await this.sessionCache.setSession(
      `ballot:${userId}`,
      JSON.stringify(ballot),
      3600,
    ); // 1 hour TTL
    return { status: 'ok' };
  }

  @Get('cache')
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Get cached ballot progress from Redis' })
  @ApiResponse({ status: 200, description: 'Ballot cache retrieved.' })
  async getCachedBallot(@Req() req: Request) {
    const userId = req.query['userId'] as string;
    if (!userId) throw new UnauthorizedException('Missing userId');
    const data = await this.sessionCache.getSession(`ballot:${userId}`);
    let ballot: unknown = null;
    try {
      ballot = data ? JSON.parse(data) : null;
    } catch {
      ballot = null;
    }
    return { ballot };
  }
}
