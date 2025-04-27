import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis';

@Injectable()
export class SessionCacheService {
  constructor(private readonly redisService: RedisService) {
    RedisService.registerUsage('SessionCacheService');
  }

  async setSession(key: string, value: string, ttlSeconds?: number) {
    const client = this.redisService.getClient('SessionCacheService');
    if (ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
  }

  async getSession(key: string): Promise<string | null> {
    const client = this.redisService.getClient('SessionCacheService');
    return client.get(key);
  }

  async deleteSession(key: string) {
    const client = this.redisService.getClient('SessionCacheService');
    await client.del(key);
  }
}
