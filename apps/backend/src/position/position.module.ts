import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClerkService } from 'src/auth/clerk.service';

@Module({
  imports: [PrismaModule],
  controllers: [PositionController],
  providers: [PositionService, ClerkService],
  exports: [PositionService],
})
export class PositionModule {}
