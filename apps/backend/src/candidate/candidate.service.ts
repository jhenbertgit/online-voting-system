import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCandidateDto: CreateCandidateDto) {
    const { id, name, bio, idHash, positionId, electionId } =
      createCandidateDto;
    if (!id || !name || !bio || !idHash || !positionId || !electionId) {
      throw new Error('All required fields must be provided');
    }
    return this.prisma.candidate.create({ data: createCandidateDto });
  }

  async findAll() {
    return this.prisma.candidate.findMany();
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    const { name, bio, idHash, positionId, electionId } = updateCandidateDto;
    if (!name || !bio || !idHash || !positionId || !electionId) {
      throw new Error('All required fields must be provided');
    }
    return this.prisma.candidate.update({
      where: { id },
      data: updateCandidateDto,
    });
  }

  async remove(id: string) {
    await this.prisma.candidate.delete({ where: { id } });
    return;
  }
}
