import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('elections')
@UseGuards(ClerkAuthGuard, RolesGuard) // Protect all endpoints in this controller
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @Get()
  @Roles(UserRole.VOTER)
  async getElections() {
    return this.electionService.getElections();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createElection(
    @Body() createElectionDto: CreateElectionDto,
    @Request() req: { user: { id: string } }, // Explicitly type the user object
  ) {
    const userId = req.user.id; // Assuming req.user is populated by ClerkAuthGuard
    // The updated DTO now includes onChainElectionId
    return this.electionService.createElection(userId, createElectionDto);
  }

  @Post('approve/:id')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  async approveElection(
    @Param('id') id: string, // Get the election ID from the URL
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id; // User ID is now safely typed
    return this.electionService.approveElection(id, userId);
  }

  @Get(':electionId/proof/:commitment')
  async getProof(@Param() params: { electionId: string; commitment: string }) {
    return this.electionService.getProof(params);
  }
}
