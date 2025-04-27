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
import { Request } from 'express';
import { LoggerService } from '../../services';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new LoggerService(RolesGuard.name);

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

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user?.id) {
      this.logger.warn('User not found in request - Authentication required');
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const userRole = await this.clerkService.getUserRole(user.id);

      // Check if the role is a valid UserRole value
      const isValidRole = Object.values(UserRole).includes(
        userRole as UserRole,
      );

      if (!isValidRole) {
        this.logger.warn(`Invalid role found for user ${user.id}: ${userRole}`);
        throw new ForbiddenException('Invalid role');
      }

      const hasRequiredRole = requiredRoles.some(
        (role) => RoleHierarchy[userRole as UserRole] >= RoleHierarchy[role],
      );

      if (!hasRequiredRole) {
        this.logger.warn(
          `User ${user.id} with role ${userRole} attempted to access route requiring ${requiredRoles.join(
            ', ',
          )}`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      this.logger.error(`Error in role check for user ${user.id}: ${error}`);
      throw new ForbiddenException('Error checking user role');
    }
  }
}
