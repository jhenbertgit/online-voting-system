import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'database/src/client';
import { LoggerService } from '../services';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new LoggerService(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    (this as any).$on('query', (e: any) => {
      this.logger.debug(
        `Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`,
      );
    });
    (this as any).$on('info', (e: any) => {
      this.logger.log(`Prisma Info: ${e.message}`);
    });
    (this as any).$on('warn', (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });
    (this as any).$on('error', (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected successfully');
    } catch (error) {
      this.logger.error(
        'Error connecting to Prisma',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', () => {
      app.close().catch((error) => {
        this.logger.error(
          'Error during app shutdown',
          error instanceof Error ? error.stack : undefined,
        );
      });
    });
  }
}
