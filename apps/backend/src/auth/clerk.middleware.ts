import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '@clerk/express';

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/webhooks/clerk') {
      // Skip authentication for the webhook route
      next();
    } else {
      // Apply authentication for other routes
      requireAuth()(req, res, next);
    }
  }
}
