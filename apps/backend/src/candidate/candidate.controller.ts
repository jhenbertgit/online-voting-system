import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types';

@ApiTags('candidates')
@Controller('candidates')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiBody({ type: CreateCandidateDto })
  @ApiResponse({ status: 201, description: 'Candidate created successfully.' })
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @Request() req: { user: { id: string } },
  ) {
    // Optionally, you can pass userId to the service if needed for auditing
    return this.candidateService.create(createCandidateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({ status: 200, description: 'List of all candidates.' })
  async findAll() {
    return this.candidateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Candidate found.' })
  async findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @ApiOperation({ summary: 'Update candidate by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCandidateDto })
  @ApiResponse({ status: 200, description: 'Candidate updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @Request() req: { user: { id: string } },
  ) {
    // Optionally, you can pass userId to the service if needed for auditing
    return this.candidateService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete candidate by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Candidate deleted successfully.' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    // Optionally, you can pass userId to the service if needed for auditing
    return this.candidateService.remove(id);
  }
}
