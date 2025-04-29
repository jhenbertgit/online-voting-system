import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly context = 'CacheService';

  constructor(private readonly redisService: RedisService) {
    RedisService.registerUsage(this.context);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = this.redisService.getClient(this.context);
    if (ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    const client = this.redisService.getClient(this.context);
    return client.get(key);
  }

  async delete(key: string): Promise<number> {
    const client = this.redisService.getClient(this.context);
    return client.del(key);
  }
}
