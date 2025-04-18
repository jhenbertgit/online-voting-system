import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Election } from 'database/src/client';
import { ConfigService } from '@nestjs/config';
import { CreateElectionDto } from './dto/create-election.dto';

@Injectable()
export class ElectionService {
  private readonly adminUserIds: string[];

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.adminUserIds = (
      this.configService.get<string>('ADMIN_USER_IDS') || ''
    ).split(',');
  }

  async getElections(): Promise<Election[]> {
    try {
      return await this.prisma.election.findMany({
        include: {
          positions: true, // Include positions related to the election
          Vote: true, // Include votes related to the election
        },
      });
    } catch (error) {
      console.error('Error fetching elections:', error);
      throw new Error('Failed to fetch elections');
    }
  }

  async createElection(
    userId: string,
    createElectionDto: CreateElectionDto,
  ): Promise<Election> {
    // Only admins can create elections
    if (!this.adminUserIds.includes(userId)) {
      throw new Error('Unauthorized: Only admins can create elections.');
    }

    try {
      return await this.prisma.election.create({
        data: {
          name: createElectionDto.name,
          description: createElectionDto.description,
          startDate: createElectionDto.startDate,
          endDate: createElectionDto.endDate,
          // Other relevant fields from a CreateElectionDto
        },
      });
    } catch (error) {
      console.error('Error creating election:', error);
      throw new Error('Failed to create election');
    }
  }

  async approveElection(id: string, userId: string): Promise<Election> {
    // Only admins and election officers can approve elections
    if (!this.adminUserIds.includes(userId)) {
      throw new Error('Unauthorized: Only admins can approve elections.');
    }

    try {
      const election = await this.prisma.election.findUnique({
        where: {
          id: id,
        },
      });

      if (!election) {
        throw new NotFoundException(`Election with ID ${id} not found`);
      }

      return await this.prisma.election.update({
        where: {
          id: id,
        },
        data: {
          // No specific fields to update for approval, but you might want to add an "approved" field
        },
      });
    } catch (error) {
      console.error('Error approving election:', error);
      throw new Error('Failed to approve election');
    }
  }

  // Just for testing purposes
  test() {
    return 'test';
  }
}
