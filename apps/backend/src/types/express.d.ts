import { UserRole } from '../auth/types';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
      sessionId: string;
      metadata: Record<string, any>;
    };
    auth?: {
      userId: string;
    };
  }
}
