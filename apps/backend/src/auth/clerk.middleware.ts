import { requireAuth } from '@clerk/express';
import { RequestHandler } from 'express';

// Clerk authentication middleware for Express
// Use this middleware to protect your routes
export const clerkAuthMiddleware: RequestHandler = requireAuth();
