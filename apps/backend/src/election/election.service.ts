/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Election } from 'database/src/client';
import { ConfigService } from '@nestjs/config';
import { CreateElectionDto } from './dto/create-election.dto';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface CandidateTree {
  candidates: string[];
}

function isCandidateTree(obj: unknown): obj is CandidateTree {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'candidates' in obj &&
    Array.isArray((obj as CandidateTree).candidates) &&
    (obj as CandidateTree).candidates.every(
      (c: unknown) => typeof c === 'string',
    )
  );
}

@Injectable()
export class ElectionService {
  private readonly adminUserIds: string[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const adminIds = this.configService.get<string>('ADMIN_USER_IDS') ?? '';
    this.adminUserIds = adminIds.split(',').filter(Boolean);
  }

  async getElections(): Promise<Election[]> {
    try {
      return await this.prisma.election.findMany({
        include: { positions: true, votes: true },
      });
    } catch (error) {
      this.handleDatabaseError(error, 'fetching elections');
    }
  }

  async createElection(
    userId: string,
    createElectionDto: CreateElectionDto,
  ): Promise<Election> {
    this.validateUserId(userId);
    this.validateAdminUser(userId);

    const dtoInstance = plainToInstance(CreateElectionDto, createElectionDto);
    this.validateDto(dtoInstance);

    try {
      return await this.prisma.election.create({
        data: {
          name: dtoInstance.name,
          description: dtoInstance.description,
          startDate: dtoInstance.startDate,
          endDate: dtoInstance.endDate,
          merkleRoot: dtoInstance.merkleRoot,
          contractAddress: dtoInstance.contractAddress,
          adminAddress: dtoInstance.adminAddress,
          onChainElectionId: dtoInstance.onChainElectionId,
        },
      });
    } catch (error) {
      this.handleDatabaseError(error, 'creating election');
    }
  }

  async approveElection(id: string, userId: string): Promise<Election> {
    this.validateUserId(userId);
    this.validateAdminUser(userId);

    try {
      return await this.prisma.election.update({
        where: { id },
        data: { approved: true },
      });
    } catch (error) {
      this.handleDatabaseError(error, 'approving election');
    }
  }

  async getProof(params: { electionId: string; commitment: string }) {
    const election = await this.findElectionById(params.electionId);
    this.validateCandidateTree(election.candidateTree);

    const candidateTree = this.parseCandidateTree(election.candidateTree);
    const leaves = this.extractLeaves(candidateTree);
    const tree = new MerkleTree(leaves, keccak256, { sort: true });

    const leafHash = keccak256(params.commitment);
    const leafBuffer = Buffer.from(leafHash.slice(2), 'hex');

    return { merkleProof: tree.getHexProof(leafBuffer) };
  }

  private async findElectionById(id: string): Promise<Election> {
    const election = await this.prisma.election.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        approved: true,
        merkleRoot: true,
        onChainElectionId: true,
        createdAt: true,
        contractAddress: true,
        adminAddress: true,
        candidateTree: true,
      },
    });

    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }
    return election;
  }

  private validateUserId(userId: string): void {
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new BadRequestException('Invalid user ID format');
    }
  }

  private validateAdminUser(userId: string): void {
    if (!this.adminUserIds.includes(userId)) {
      throw new UnauthorizedException(
        'Insufficient privileges for this operation',
      );
    }
  }

  private validateDto(dto: CreateElectionDto): void {
    const errors = validateSync(dto);
    if (errors.length > 0) {
      const message = errors
        .flatMap((e) => Object.values(e.constraints ?? {}))
        .join('; ');
      throw new BadRequestException(`Invalid request: ${message}`);
    }
  }

  private parseCandidateTree(candidateTree: unknown): CandidateTree {
    try {
      const parsed =
        typeof candidateTree === 'string'
          ? JSON.parse(candidateTree)
          : candidateTree;

      if (!isCandidateTree(parsed)) {
        throw new Error('Invalid candidate tree structure');
      }
      return parsed;
    } catch (error) {
      throw new InternalServerErrorException(
        'Malformed candidate tree data in database',
        { cause: error },
      );
    }
  }

  private validateCandidateTree(
    candidateTree: unknown,
  ): asserts candidateTree is string | CandidateTree {
    if (!candidateTree) {
      throw new NotFoundException('Candidate tree data not available');
    }
  }

  private extractLeaves(candidateTree: CandidateTree): Buffer[] {
    return candidateTree.candidates.map((candidateId) => {
      if (typeof candidateId !== 'string') {
        throw new InternalServerErrorException('Invalid candidate ID type');
      }
      const hash = keccak256(candidateId);
      return Buffer.from(hash.slice(2), 'hex');
    });
  }

  private handleDatabaseError(error: unknown, context: string): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown database error';
    console.error(`Error ${context}:`, error);
    throw new InternalServerErrorException(
      `Failed ${context}: ${errorMessage}`,
    );
  }
}
