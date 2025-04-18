import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole, RoleHierarchy } from '../types';
import { ClerkService } from '../clerk.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private clerkService: ClerkService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, access granted
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const userRole = await this.clerkService.getUserRole(user.id);

      if (!(userRole in UserRole)) {
        throw new ForbiddenException('Invalid role');
      }

      return requiredRoles.some(
        (role) => RoleHierarchy[userRole as UserRole] >= RoleHierarchy[role],
      );
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error fetching user role:', error);
      return false; // Deny access in case of an error
    }
  }
}
