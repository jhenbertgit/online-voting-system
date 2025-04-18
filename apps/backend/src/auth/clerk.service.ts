import { Injectable } from '@nestjs/common';
import { ClerkClient, createClerkClient } from '@clerk/express';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './types';

@Injectable()
export class ClerkService {
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
    const user = await this.getUser(userId);
    const role = user.publicMetadata?.role as UserRole;
    return role || UserRole.VOTER;
  }
}
