import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { LoggerService } from '../../services';
import { UserRole } from '../types';

interface ClerkAuth {
  userId: string;
  role?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

interface ClerkUser {
  id: string;
  role: UserRole;
  sessionId: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new LoggerService(ClerkAuthGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow unauthenticated access to Clerk webhook
    const request = context.switchToHttp().getRequest();
    if (
      request.method === 'POST' &&
      (request.path === '/api/v1/webhooks/clerk' ||
        request.originalUrl === '/api/v1/webhooks/clerk')
    ) {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!request.auth?.userId) {
      this.logger.warn(
        `[ClerkAuthGuard] Missing User ID - Not Authenticated | url: ${request.originalUrl} | method: ${request.method} | headers: ${JSON.stringify(request.headers)} | auth: ${JSON.stringify(request.auth)} | body: ${JSON.stringify(request.body)}`,
      );
      throw new UnauthorizedException('Authentication required');
    }

    // Attach user object for downstream guards/controllers
    const { userId, role, sessionId, metadata } = request.auth;
    // Default role to VOTER if not present or not a valid UserRole
    let userRole: UserRole = UserRole.VOTER;
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      userRole = role as UserRole;
    }
    const user: ClerkUser = {
      id: userId,
      role: userRole,
      sessionId: sessionId ?? '',
      metadata: metadata ?? {},
    };
    request.user = user;
    return true; // User is authenticated
  }
}
