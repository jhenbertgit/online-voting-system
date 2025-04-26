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
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { Request } from 'express';
import { WebhookEventDto } from './dto/webhook-event.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Clerk webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  async handleClerkWebhook(
    @Headers() headers: Record<string, string>,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: WebhookEventDto,
  ) {
    try {
      // 1. Verify webhook signature
      const event = await this.webhookService.verifyClerkWebhook(
        headers,
        req.rawBody?.toString() ?? '',
      );

      if (!event) {
        this.webhookService.logger.error('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // 2. Process the event
      return await this.webhookService.processWebhook(event);
    } catch (error) {
      this.webhookService.logger.error(`Webhook processing failed: ${error.message}`);
      throw new UnauthorizedException('Webhook processing failed');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Test connection established.' })
  test() {
    return this.webhookService.test();
  }
}
