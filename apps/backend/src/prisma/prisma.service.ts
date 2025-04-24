import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'database/src/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, () => {
      app.close().catch((error) => {
        console.error('Error during app shutdown:', error);
      });
    });
  }
}
