import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { Request as ExpressRequest } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { clerkMiddleware } from '@clerk/express';
// Extend the Express Request type to include rawBody
declare module 'express' {
  interface Request {
    rawBody?: Buffer;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Clerk webhook raw body middleware - must come before global pipes and other middleware
  app.use(clerkMiddleware({}));

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

  app.setGlobalPrefix('api/v1');

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

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
