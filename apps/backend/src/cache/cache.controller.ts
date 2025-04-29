import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { SetCacheDto } from './dto/set-cache.dto';

@ApiTags('cache')
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Post()
  @ApiOperation({
    summary: 'Set a cache entry (generic key-value with optional TTL)',
  })
  @ApiBody({
    schema: {
      example: { key: 'example-key', value: 'example-value', ttlSeconds: 3600 },
    },
  })
  @ApiResponse({ status: 200, description: 'Cache entry set successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 500, description: 'Failed to set cache.' })
  @UsePipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }),
  )
  async setCache(@Body() body: SetCacheDto) {
    try {
      await this.cacheService.set(body.key, body.value, body.ttlSeconds);
      return { status: 'ok' };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        { message: 'Failed to set cache', error: errMsg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get cache entry by key' })
  @ApiParam({ name: 'key', type: String })
  @ApiResponse({ status: 200, description: 'Cache entry retrieved.' })
  @ApiResponse({ status: 404, description: 'Key not found.' })
  @ApiResponse({ status: 500, description: 'Failed to get cache.' })
  async getCache(@Param('key') key: string) {
    try {
      const value = await this.cacheService.get(key);
      if (value === null) {
        throw new HttpException('Key not found', HttpStatus.NOT_FOUND);
      }
      return { key, value };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        { message: 'Failed to get cache', error: errMsg },
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete cache entry by key' })
  @ApiParam({ name: 'key', type: String })
  @ApiResponse({ status: 200, description: 'Cache entry deleted.' })
  @ApiResponse({ status: 404, description: 'Key not found.' })
  @ApiResponse({ status: 500, description: 'Failed to delete cache.' })
  async deleteCache(@Param('key') key: string) {
    try {
      const deleted = await this.cacheService.delete(key);
      if (deleted === 0) {
        throw new HttpException('Key not found', HttpStatus.NOT_FOUND);
      }
      return { key, deleted };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        { message: 'Failed to delete cache', error: errMsg },
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
