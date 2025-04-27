import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from '../redis';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private rateLimiter: RateLimiterRedis;

  constructor(private readonly redisService: RedisService) {
    RedisService.registerUsage('RateLimiterMiddleware');
  }

  private getLimiter() {
    if (!this.rateLimiter) {
      this.rateLimiter = new RateLimiterRedis({
        storeClient: this.redisService.getClient('RateLimiterMiddleware'),
        keyPrefix: 'rlflx',
        points: 5, // 5 votes
        duration: 60, // per minute
      });
    }
    return this.rateLimiter;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    try {
      await this.getLimiter().consume(ip);
      next();
    } catch {
      res.status(429).json({
        message: 'Too many votes. Please try again later.',
      });
    }
  }
}
