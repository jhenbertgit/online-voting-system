import {
  INestApplication,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from 'database/src/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();

    (this as any).$on(
      'query',
      (e: { query: string; params: string; duration: number } | unknown) => {
        if (
          e &&
          typeof e === 'object' &&
          'query' in e &&
          'params' in e &&
          'duration' in e
        ) {
          const query = (e as { query: string }).query;
          const params = (e as { params: string }).params;
          const duration = (e as { duration: number }).duration;
          this.logger.debug(
            `Prisma Query: ${query} | Params: ${params} | Duration: ${duration}ms`,
          );
        } else {
          this.logger.debug(`Query event: ${JSON.stringify(e)}`);
        }
      },
    );
    (this as any).$on('info', (e: { message: string } | unknown) => {
      if (e && typeof e === 'object' && 'message' in e) {
        this.logger.log(`Prisma Info: ${(e as { message: string }).message}`);
      } else {
        this.logger.log(`Prisma Info: ${JSON.stringify(e)}`);
      }
    });
    (this as any).$on('warn', (e: { message: string } | unknown) => {
      if (e && typeof e === 'object' && 'message' in e) {
        this.logger.warn(
          `Prisma Warning: ${(e as { message: string }).message}`,
        );
      } else {
        this.logger.warn(`Prisma Warning: ${JSON.stringify(e)}`);
      }
    });
    (this as any).$on('error', (e: { message: string } | unknown) => {
      if (e && typeof e === 'object' && 'message' in e) {
        this.logger.error(
          `Prisma Error: ${(e as { message: string }).message}`,
        );
      } else {
        this.logger.error(`Prisma Error: ${JSON.stringify(e)}`);
      }
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
