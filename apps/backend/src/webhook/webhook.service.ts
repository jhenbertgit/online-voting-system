import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'database/src/client';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/express';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly svixClient: Webhook;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.svixClient = new Webhook(
      this.configService.get('CLERK_WEBHOOK_SECRET') as string,
    );
  }

  async verifyClerkWebhook(
    headers: Record<string, string>,
    rawPayload: string,
  ): Promise<WebhookEvent | null> {
    const {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    } = headers;

    if (!svixId || !svixTimestamp || !svixSignature) {
      this.logger.error('Missing required Svix headers');
      return null;
    }

    try {
      return this.svixClient.verify(rawPayload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      this.logger.error(`Webhook verification failed: ${err.message}`);
      return null;
    }
  }

  async processWebhook(event: WebhookEvent): Promise<User | void> {
    switch (event.type) {
      case 'user.created':
        return this.handleUserCreated(event.data);
      case 'user.updated':
        return this.handleUserUpdated(event.data);
      case 'user.deleted':
        return this.handleUserDeleted(event.data);
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleUserCreated(data: WebhookEvent['data']): Promise<User> {
    try {
      if (
        !('email_addresses' in data) ||
        !Array.isArray((data as any).email_addresses)
      ) {
        throw new Error('Webhook data does not contain email_addresses');
      }
      const { id: clerkUserId, email_addresses, ...rest } = data as any;
      const email = email_addresses[0].email_address;

      return await this.prisma.user.create({
        data: {
          clerkUserId,
          email,
          // Add other fields from `rest` as needed
        },
      });
    } catch (error) {
      this.logger.error(`User creation failed: ${error.message}`);
      throw new Error('Failed to create user');
    }
  }

  private async handleUserUpdated(data: WebhookEvent['data']): Promise<User> {
    try {
      // Type guard: check if email_addresses exists before destructuring
      if (
        !('email_addresses' in data) ||
        !Array.isArray((data as any).email_addresses)
      ) {
        throw new Error('Webhook data does not contain email_addresses');
      }
      const { id: clerkUserId, email_addresses, ...rest } = data as any;
      const email = email_addresses[0].email_address;

      return await this.prisma.user.update({
        where: { clerkUserId },
        data: {
          email,
          // Update other fields from `rest` as needed
        },
      });
    } catch (error) {
      this.logger.error(`User update failed: ${error.message}`);
      throw new Error('Failed to update user');
    }
  }

  private async handleUserDeleted(data: WebhookEvent['data']): Promise<void> {
    try {
      const { id: clerkUserId } = data;
      await this.prisma.user.delete({ where: { clerkUserId } });
    } catch (error) {
      this.logger.error(`User deletion failed: ${error.message}`);
      throw new Error('Failed to delete user');
    }
  }

  test() {
    return 'test';
  }
}
