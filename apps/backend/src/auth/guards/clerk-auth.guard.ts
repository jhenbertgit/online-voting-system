import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../services';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new LoggerService(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.auth?.userId) {
      this.logger.warn('Missing User ID - Not Authenticated');
      throw new UnauthorizedException('Authentication required');
    }

    // Attach user object for downstream guards/controllers
    req.user = {
      id: req.auth.userId,
      role: (req.auth as any)?.role,
      sessionId: (req.auth as any)?.sessionId,
      metadata: (req.auth as any)?.metadata ?? {},
    };
    return true; // User is authenticated
  }
}
