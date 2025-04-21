import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';
import { ValidationPipe } from '@nestjs/common';
import { RateLimiterMiddleware } from './middleware';
import { RedisService } from './redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  // Clerk middleware
  app.use(
    clerkMiddleware({
      secretKey: process.env.CLERK_SECRET_KEY,
      // Add other Clerk middleware options here as needed
    }),
  );

  // Rate limiting middleware for /ballot POST (votes)
  const redisService = app.get(RedisService);
  app.use('/api/ballot', new RateLimiterMiddleware(redisService).use);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
