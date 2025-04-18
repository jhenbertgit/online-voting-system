import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { verify } from 'jsonwebtoken';
import { User } from 'database/src/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  verifyClerkSignature(
    signature: string,
    payload: any,
    secret: string,
  ): boolean {
    if (!signature) {
      console.log('No signature');
      return false;
    }
    const expectedSignature = Buffer.from(signature, 'base64').toString(
      'utf-8',
    );

    try {
      const verified = verify(payload, secret, {
        algorithms: ['HS256'],
      });
      return !!verified;
    } catch (error) {
      console.log('error signature');
      return false;
    }
  }

  async handleUserCreated(data: any): Promise<User> {
    try {
      // Extract relevant user data from Clerk's payload
      const { id: clerkUserId, emailAddresses, ...rest } = data;
      const email = emailAddresses[0].emailAddress;

      // Create a new user in your database
      const newUser = await this.prisma.user.create({
        data: {
          clerkUserId,
          email,
          // Add other fields as needed (e.g., from `rest`)
        },
      });

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async handleUserUpdated(data: any): Promise<User> {
    try {
      // Extract relevant user data from Clerk's payload
      const { id: clerkUserId, emailAddresses, ...rest } = data;
      const email = emailAddresses[0].emailAddress;

      // Update the existing user in your database
      const updatedUser = await this.prisma.user.update({
        where: {
          clerkUserId,
        },
        data: {
          email,
          // Update other fields as needed (e.g., from `rest`)
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async handleUserDeleted(data: any): Promise<void> {
    try {
      // Extract the user's Clerk ID from the payload
      const { id: clerkUserId } = data;

      // Delete the user from your database
      await this.prisma.user.delete({
        where: {
          clerkUserId,
        },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}
