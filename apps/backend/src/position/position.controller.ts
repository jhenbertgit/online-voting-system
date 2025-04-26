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
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('positions')
@Controller('positions')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  @Roles(UserRole.VOTER)
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'List of all positions.' })
  async getPositions() {
    return this.positionService.getPositions();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new position' })
  @ApiBody({ type: CreatePositionDto })
  @ApiResponse({ status: 201, description: 'Position created successfully.' })
  async createPosition(
    @Body() createPositionDto: CreatePositionDto,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return this.positionService.createPosition(userId, createPositionDto);
  }

  @Post('update/:id')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @ApiOperation({ summary: 'Update position by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreatePositionDto })
  @ApiResponse({ status: 200, description: 'Position updated successfully.' })
  async updatePosition(
    @Param('id') id: string,
    @Body() updatePositionDto: CreatePositionDto,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return this.positionService.updatePosition(id, userId, updatePositionDto);
  }

  @Post('delete/:id')
  @Roles(UserRole.ADMIN, UserRole.ELECTION_OFFICER)
  @ApiOperation({ summary: 'Delete position by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Position deleted successfully.' })
  async deletePosition(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return this.positionService.deletePosition(id, userId);
  }
}
