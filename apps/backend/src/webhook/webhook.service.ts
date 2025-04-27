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
      this.logger.error(
        `Webhook verification failed: ${(err as Error).message}`,
      );
      return null;
    }
  }

  async processWebhook(event: WebhookEvent): Promise<User | void> {
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
      this.logger.error(`User creation failed: ${error.message}`);
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
      this.logger.error(`User update failed: ${error.message}`);
      throw new Error('Failed to update user');
    }
  }

  private async handleUserDeleted(data: Partial<WebhookEventDto>): Promise<void> {
    try {
      const { id: clerkUserId } = data;
      await this.prisma.user.delete({ where: { clerkUserId } });
    } catch (error) {
      this.logger.error(`User deletion failed: ${error.message}`);
      throw new Error('Failed to delete user');
    }
  }

  test() {
    return 'test connection established';
  }
}
