import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class WebhookEmailAddressDto {
  @ApiProperty()
  @IsString()
  email_address: string;
}

export class WebhookEventDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ type: [WebhookEmailAddressDto] })
  @IsArray()
  email_addresses: WebhookEmailAddressDto[];

  @ApiProperty()
  @IsOptional()
  @IsObject()
  rest?: Record<string, any>;
}
