import { Module } from '@nestjs/common';
import { ElectionController } from './election.controller';
import { ElectionService } from './election.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClerkService } from 'src/auth/clerk.service';

@Module({
  imports: [PrismaModule],
  controllers: [ElectionController],
  providers: [ElectionService, ClerkService],
  exports: [ElectionService],
})
export class ElectionModule {}
