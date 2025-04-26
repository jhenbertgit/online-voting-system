import { Injectable, Logger } from '@nestjs/common';
import { ClerkClient, createClerkClient } from '@clerk/express';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './types';

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly clerk: ClerkClient;

  constructor(private config: ConfigService) {
    this.clerk = createClerkClient({
      secretKey: config.get('CLERK_SECRET_KEY'),
    });
  }

  async getUser(userId: string) {
    return this.clerk.users.getUser(userId);
  }

  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const user = await this.getUser(userId);
      const role = user.publicMetadata?.role as UserRole;

      this.logger.debug(`Retrieved role for user ${userId}: ${role}`);

      // Validate that the role is a valid UserRole
      if (role && Object.values(UserRole).includes(role)) {
        return role;
      }

      // If no valid role is found, return the default role
      this.logger.warn(
        `No valid role found for user ${userId}, defaulting to ${UserRole.VOTER}`,
      );
      return UserRole.VOTER;
    } catch (error) {
      this.logger.error(`Error getting role for user ${userId}:`, error);
      return UserRole.VOTER; // Default to VOTER on error
    }
  }
}
