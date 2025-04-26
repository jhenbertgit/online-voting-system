import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { Request as ExpressRequest } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Extend the Express Request type to include rawBody
declare module 'express' {
  interface Request {
    rawBody?: Buffer;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Clerk webhook raw body middleware - must come before global pipes and other middleware
  app.use(
    '/api/v1/webhooks/clerk',
    bodyParser.raw({ type: '*/*' }),
    (
      req: ExpressRequest,
      res: import('express').Response,
      next: import('express').NextFunction,
    ) => {
      req.rawBody = req.body;
      next();
    },
  );

  app.enableCors({
    origin: true, // or true for all origins, or an array of allowed origins
    credentials: true, // if you use cookies/auth
  });

  app.setGlobalPrefix('api/v1');

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  // Clerk middleware
  app.use(
    clerkMiddleware({
      secretKey: process.env.CLERK_SECRET_KEY,
      // Add other Clerk middleware options here as needed
    }),
  );

  // Swagger/OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Online Voting System API')
    .setDescription('API documentation for the Online Voting System backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
