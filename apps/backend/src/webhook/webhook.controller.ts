import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK) // Clerk requires a 200 OK response
  async handleClerkWebhook(
    @Headers('Clerk-Signature') clerkSignature: string,
    @Body() payload: any,
  ) {
    const clerkWebhookSecret = this.configService.get<string>(
      'CLERK_WEBHOOK_SECRET',
    );

    if (!clerkWebhookSecret) {
      console.error('Clerk webhook secret not set.');
      return;
    }

    try {
      // Verify the Clerk signature
      const verified = this.webhookService.verifyClerkSignature(
        clerkSignature,
        payload,
        clerkWebhookSecret,
      );

      if (!verified) {
        console.warn('Invalid Clerk signature.');
        return;
      }

      const eventType = payload.type; // e.g., 'user.created', 'user.updated'

      // Handle different event types
      switch (eventType) {
        case 'user.created':
          await this.webhookService.handleUserCreated(payload.data);
          break;
        case 'user.updated':
          await this.webhookService.handleUserUpdated(payload.data);
          break;
        case 'user.deleted':
          await this.webhookService.handleUserDeleted(payload.data);
          break;
        default:
          console.log(`Unhandled Clerk event: ${eventType}`);
      }
    } catch (error) {
      console.error('Error handling Clerk webhook:', error);
    }
  }
}
