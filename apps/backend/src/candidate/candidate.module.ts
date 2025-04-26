import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ClerkService } from 'src/auth/clerk.service';

@Module({
  imports: [PrismaModule],
  controllers: [CandidateController],
  providers: [CandidateService, ClerkService],
  exports: [CandidateService],
})
export class CandidateModule {}
