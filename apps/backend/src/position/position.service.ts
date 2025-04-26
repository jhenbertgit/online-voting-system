import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePositionDto } from './dto/create-position.dto';

@Injectable()
export class PositionService {
  private readonly adminUserIds: string[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const adminIds = this.configService.get<string>('ADMIN_USER_IDS') ?? '';
    this.adminUserIds = adminIds.split(',').filter(Boolean);
  }

  async getPositions() {
    try {
      return await this.prisma.position.findMany();
    } catch (error) {
      this.handleDatabaseError(error, 'fetching positions');
    }
  }

  async createPosition(userId: string, createPositionDto: CreatePositionDto) {
    this.validateUserId(userId);
    this.validateAdminUser(userId);
    try {
      return await this.prisma.position.create({
        data: {
          ...createPositionDto,
        },
      });
    } catch (error) {
      this.handleDatabaseError(error, 'creating position');
    }
  }

  async updatePosition(
    id: string,
    userId: string,
    updatePositionDto: CreatePositionDto,
  ) {
    this.validateUserId(userId);
    this.validateAdminUser(userId);
    try {
      return await this.prisma.position.update({
        where: { id },
        data: {
          ...updatePositionDto,
        },
      });
    } catch (error) {
      this.handleDatabaseError(error, 'updating position');
    }
  }

  async deletePosition(id: string, userId: string) {
    this.validateUserId(userId);
    this.validateAdminUser(userId);
    try {
      return await this.prisma.position.delete({
        where: { id },
      });
    } catch (error) {
      this.handleDatabaseError(error, 'deleting position');
    }
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

  private handleDatabaseError(error: unknown, context: string): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown database error';
    console.error(`Error ${context}:`, error);
    throw new InternalServerErrorException(
      `Failed ${context}: ${errorMessage}`,
    );
  }
}
