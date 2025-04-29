import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'database/src/client';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/express';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class WebhookService {
  public readonly logger = new LoggerService(WebhookService.name);
  private readonly svixClient: Webhook;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.svixClient = new Webhook(
      this.configService.get('CLERK_WEBHOOK_SECRET') as string,
    );
  }

  verifyClerkWebhook(
    headers: Record<string, string>,
    rawPayload: string,
  ): WebhookEvent | null {
    try {
      const event = this.svixClient.verify(rawPayload, headers) as WebhookEvent;
      return event;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Webhook verification failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Webhook verification failed: ${String(error)}`);
      }
      return null;
    }
  }

  async processWebhook(event: WebhookEvent): Promise<User | void> {
    try {
      switch (event.type) {
        case 'user.created':
          return this.handleUserCreated(event.data as WebhookEventDto);
        case 'user.updated':
          return this.handleUserUpdated(event.data as WebhookEventDto);
        case 'user.deleted': {
          // For deleted events, allow partial data (only id is required)
          const { id } = event.data as { id: string };
          if (!id) {
            this.logger.error('Webhook data for deletion missing id');
            throw new Error('Webhook data for deletion missing id');
          }
          return this.handleUserDeleted({ id } as WebhookEventDto);
        }
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.handleWebhookError(error);
    }
  }

  private async handleUserCreated(data: WebhookEventDto): Promise<User> {
    try {
      if (!data.email_addresses || !Array.isArray(data.email_addresses)) {
        throw new Error('Webhook data does not contain email_addresses');
      }
      const { id: clerkUserId, email_addresses, ...rest } = data;
      const email = email_addresses[0].email_address;

      return await this.prisma.user.create({
        data: {
          clerkUserId,
          email,
          ...rest,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `User creation failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`User creation failed: ${String(error)}`);
      }
      throw new Error('Failed to create user');
    }
  }

  private async handleUserUpdated(data: WebhookEventDto): Promise<User> {
    try {
      if (!data.email_addresses || !Array.isArray(data.email_addresses)) {
        throw new Error('Webhook data does not contain email_addresses');
      }
      const { id: clerkUserId, email_addresses, ...rest } = data;
      const email = email_addresses[0].email_address;

      return await this.prisma.user.update({
        where: { clerkUserId },
        data: {
          email,
          ...rest,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`User update failed: ${error.message}`, error.stack);
      } else {
        this.logger.error(`User update failed: ${String(error)}`);
      }
      throw new Error('Failed to update user');
    }
  }

  private async handleUserDeleted(
    data: Partial<WebhookEventDto>,
  ): Promise<void> {
    try {
      const { id: clerkUserId } = data;
      await this.prisma.user.delete({ where: { clerkUserId } });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `User deletion failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`User deletion failed: ${String(error)}`);
      }
      throw new Error('Failed to delete user');
    }
  }

  private handleWebhookError(error: unknown): void {
    if (error instanceof Error) {
      this.logger.error('Webhook error', error.stack);
    } else {
      this.logger.error('Webhook error', String(error));
    }
  }

  test() {
    return 'test connection established';
  }
}
