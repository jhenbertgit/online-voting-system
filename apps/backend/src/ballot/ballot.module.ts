import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BallotController } from './ballot.controller';
import { BallotService } from './ballot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RedisService } from '../redis';
import { SessionCacheService } from '../services';
import { RateLimiterMiddleware } from '../middleware';
import { CacheService } from '../cache/cache.service';
import { CacheController } from '../cache/cache.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BallotController, CacheController],
  providers: [
    BallotService,
    RedisService,
    SessionCacheService,
    RateLimiterMiddleware,
    CacheService,
  ],
  exports: [BallotService, RedisService, SessionCacheService, CacheService],
})
export class BallotModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimiterMiddleware).forRoutes('ballot');
  }
}
