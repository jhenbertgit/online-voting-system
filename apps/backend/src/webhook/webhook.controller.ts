import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  RawBodyRequest,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request } from 'express';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Headers() headers: Record<string, string>,
    @Req() req: RawBodyRequest<Request>,
  ) {
    try {
      // 1. Verify webhook signature
      const event = await this.webhookService.verifyClerkWebhook(
        headers,
        req.rawBody?.toString() ?? '',
      );

      if (!event) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // 2. Process the event
      return await this.webhookService.processWebhook(event);
    } catch (error) {
      console.error(`Webhook processing failed: ${error.message}`);
      throw error; // Let NestJS handle the exception
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  test() {
    return this.webhookService.test();
  }
}
