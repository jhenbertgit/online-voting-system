import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BallotModule } from './ballot/ballot.module';
import { AuthModule } from './auth/auth.module';
import { ElectionModule } from './election/election.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BallotModule,
    AuthModule,
    ElectionModule,
  ],
})
export class AppModule {}
