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
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { Request } from 'express';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Clerk webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async handleClerkWebhook(
    @Headers('clerk-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    try {
      // 1. Verify webhook signature
      const event = await this.webhookService.verifyClerkWebhook(
        { 'clerk-signature': signature },
        req.rawBody?.toString() ?? '',
      );

      if (!event) {
        this.webhookService.logger.error('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // 2. Process the event
      return await this.webhookService.processWebhook(event);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.webhookService.logger.error(`Webhook processing failed: ${errMsg}`);
      throw new HttpException(
        { message: 'Webhook processing failed', error: errMsg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
