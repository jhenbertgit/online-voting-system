import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BallotModule } from './ballot/ballot.module';
import { AuthModule } from './auth/auth.module';
import { ElectionModule } from './election/election.module';
import { RedisModule } from './redis/redis.module';
import { SessionCacheService } from './services';
import { PositionModule } from './position/position.module';
import { WebhookModule } from './webhook/webhook.module';
import { CandidateModule } from './candidate/candidate.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BallotModule,
    AuthModule,
    ElectionModule,
    RedisModule,
    PositionModule,
    CacheModule,
    WebhookModule,
    CandidateModule,
  ],
  providers: [SessionCacheService],
  exports: [SessionCacheService],
})
export class AppModule {}
