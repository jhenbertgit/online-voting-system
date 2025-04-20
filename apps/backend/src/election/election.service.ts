import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Election } from 'database/src/client';
import { ConfigService } from '@nestjs/config';
import { CreateElectionDto } from './dto/create-election.dto';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers';
import { keccak256 as keccak256Ethereum } from 'ethereum-cryptography/keccak';

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
          votes: true, // Include votes related to the election
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
          merkleRoot: createElectionDto.merkleRoot,
          contractAddress: createElectionDto.contractAddress,
          adminAddress: createElectionDto.adminAddress,
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

  async getProof(params: { electionId: string; commitment: string }) {
    const election = await this.prisma.election.findUnique({
      where: { id: params.electionId },
      select: {
        candidateTree: true, // Ensure you have the candidateTree
        merkleRoot: true, // Ensure you have merkleRoot
      },
    });

    if (!election) {
      throw new NotFoundException(
        `Election with ID ${params.electionId} not found`,
      );
    }

    if (!election.candidateTree) {
      throw new NotFoundException(
        `Candidate tree not found for election ID ${params.electionId}`,
      );
    }

    // 1. Extract leaves from candidateTree (adjust according to its actual structure)
    const leaves = this.extractLeaves(election.candidateTree);

    // 2. Rebuild the Merkle Tree
    const tree = new MerkleTree(leaves, keccak256Ethereum, { sort: true });

    // 3. Generate the Merkle Proof
    const leaf = keccak256(params.commitment); // Hash the commitment
    const proof = tree.getHexProof(leaf); // Get the proof

    return {
      merkleProof: proof,
    };
  }

  private extractLeaves(candidateTree: any): Buffer[] {
    if (!candidateTree || typeof candidateTree !== 'object') {
      throw new Error('Invalid candidate tree format: must be a JSON object');
    }

    if (!candidateTree.candidates || !Array.isArray(candidateTree.candidates)) {
      throw new Error(
        'Invalid candidate tree format: must have a "candidates" array',
      );
    }

    try {
      return candidateTree.candidates.map((candidateId) => {
        if (typeof candidateId !== 'string') {
          throw new Error('Candidate IDs must be strings');
        }
        const hash = keccak256(candidateId);
        return Buffer.from(hash, 'hex');
      });
    } catch (error) {
      throw new Error(`Error extracting leaves: ${error.message}`);
    }
  }
}
