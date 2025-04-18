import { Module } from '@nestjs/common';
import { BallotController } from './ballot.controller';
import { BallotService } from './ballot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BallotController],
  providers: [BallotService],
  exports: [BallotService],
})
export class BallotModule {}
