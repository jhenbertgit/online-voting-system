import { Module } from '@nestjs/common';
import { BallotController } from './ballot.controller';
import { BallotService } from './ballot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RedisService } from '../redis';
import { SessionCacheService } from '../services';
import { RateLimiterMiddleware } from '../middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BallotController],
  providers: [
    BallotService,
    RedisService,
    SessionCacheService,
    RateLimiterMiddleware,
  ],
  exports: [BallotService, RedisService, SessionCacheService],
})
export class BallotModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimiterMiddleware).forRoutes('ballot');
  }
}
