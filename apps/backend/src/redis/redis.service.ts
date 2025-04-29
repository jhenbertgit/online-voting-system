import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerService } from '../services';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new LoggerService(RedisService.name);
  private static usageContexts: Set<string> = new Set();

  /**
   * Call this method in any service or middleware that uses RedisService
   * to dynamically register its usage context for logging.
   * Example: RedisService.registerUsage('SessionCacheService');
   */
  static registerUsage(context: string) {
    RedisService.usageContexts.add(context);
  }

  onModuleInit() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
      });
      this.logger.log('Redis client connected successfully');

      // Log Redis command execution
      this.client.on('command', (...args: unknown[]) => {
        const cmd = args[0];
        if (
          cmd &&
          typeof cmd === 'object' &&
          Object.prototype.hasOwnProperty.call(cmd, 'name') &&
          typeof (cmd as Record<string, unknown>).name === 'string' &&
          Object.prototype.hasOwnProperty.call(cmd, 'args') &&
          Array.isArray((cmd as Record<string, unknown>).args)
        ) {
          this.logger.debug(
            `Redis Command: ${((cmd as { name: string }).name)} Args: ${JSON.stringify((cmd as { args: unknown[] }).args)}`,
          );
        } else {
          this.logger.debug(`Redis Command (unknown structure): ${JSON.stringify(cmd)}`);
        }
      });

      // Log Redis error events
      this.client.on('error', (error: unknown) => {
        if (error instanceof Error) {
          this.logger.error('Redis Error Event', error.stack);
        } else {
          this.logger.error('Redis Error Event', String(error));
        }
      });

      // Log when Redis is ready to receive commands
      this.client.on('ready', () => {
        this.logger.log('Redis connection is ready to receive commands');
      });

      // Log reconnecting attempts
      this.client.on('reconnecting', (time: unknown) => {
        if (typeof time === 'number') {
          this.logger.warn(`Redis reconnecting (delay: ${time}ms)`);
        } else {
          this.logger.warn('Redis reconnecting');
        }
      });

      // Log successful reconnection
      this.client.on('connect', () => {
        this.logger.log('Redis client reconnected');
      });

      // Log when Redis connection is closed
      this.client.on('end', () => {
        this.logger.warn('Redis connection closed');
      });

      // Log when Redis connection is lost and will not reconnect
      this.client.on('close', () => {
        this.logger.error('Redis connection closed and will not reconnect');
      });

      // Log when Redis server sends a warning
      this.client.on('warning', (warning: unknown) => {
        this.logger.warn(`Redis server warning: ${String(warning)}`);
      });

      // Log subscription messages (Pub/Sub)
      this.client.on('message', (...args: unknown[]) => {
        if (args.length === 2) {
          const [channel, message] = args;
          this.logger.debug(
            `Redis Pub/Sub message on channel ${String(channel)}: ${String(message)}`,
          );
        } else {
          this.logger.debug(`Redis Pub/Sub message: ${JSON.stringify(args)}`);
        }
      });
      this.client.on('pmessage', (...args: unknown[]) => {
        if (args.length === 3) {
          const [pattern, channel, message] = args;
          this.logger.debug(
            `Redis Pub/Sub pmessage on pattern ${String(pattern)}, channel ${String(channel)}: ${String(message)}`,
          );
        } else {
          this.logger.debug(`Redis Pub/Sub pmessage: ${JSON.stringify(args)}`);
        }
      });

      // Dynamically log which services are using RedisService
      setTimeout(() => {
        const usedBy = Array.from(RedisService.usageContexts);
        if (usedBy.length > 0) {
          this.logger.log(
            `RedisService is currently used by: ${usedBy.join(', ')}`,
          );
        } else {
          this.logger.warn(
            'No backend services have registered usage of RedisService',
          );
        }
      }, 500); // Give services a moment to register usage
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error connecting to Redis', error.stack);
      } else {
        this.logger.error('Error connecting to Redis', String(error));
      }
      throw error;
    }
  }

  getClient(context?: string) {
    if (context) {
      RedisService.registerUsage(context);
    }
    return this.client;
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('Redis client disconnected successfully');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error disconnecting from Redis', error.stack);
      } else {
        this.logger.error('Error disconnecting from Redis', String(error));
      }
    }
  }
}
