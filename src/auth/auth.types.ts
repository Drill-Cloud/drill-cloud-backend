import type { Request } from 'express';

export type AuthUser = {
  subject: string;
  username: string | null;
  allowedEdges: string[];
  isAdmin: boolean;
};

export type AuthenticatedRequest = Request & {
  user: AuthUser;
};
