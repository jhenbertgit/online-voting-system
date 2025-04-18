import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  // Clerk middleware
  app.use(
    clerkMiddleware({
      secretKey: process.env.CLERK_SECRET_KEY,
      // Add other Clerk middleware options here as needed
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
