import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types';

@ApiTags('elections')
@Controller('elections')
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @Get()
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Get all elections' })
  @ApiResponse({ status: 200, description: 'List of all elections.' })
  async getElections() {
    return this.electionService.getElections();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new election' })
  @ApiBody({ type: CreateElectionDto })
  @ApiResponse({ status: 201, description: 'Election created successfully.' })
  async createElection(
    @Body() createElectionDto: CreateElectionDto,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return this.electionService.createElection(createElectionDto, userId);
  }

  @Post('approve/:id')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @ApiOperation({ summary: 'Approve election by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Election approved successfully.' })
  async approveElection(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return this.electionService.approveElection(id, userId);
  }

  @Get(':electionId/proof/:commitment')
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Get proof for election commitment' })
  @ApiParam({ name: 'electionId', type: String })
  @ApiParam({ name: 'commitment', type: String })
  @ApiResponse({ status: 200, description: 'Proof retrieved successfully.' })
  async getProof(@Param() params: { electionId: string; commitment: string }) {
    return this.electionService.getProof(params);
  }
}
