export enum UserRole {
  ADMIN = 'admin',
  ELECTION_OFFICER = 'election_officer',
  VOTER = 'voter',
}

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 3,
  [UserRole.ELECTION_OFFICER]: 2,
  [UserRole.VOTER]: 1,
};

export type UserRoleType = `${UserRole}`; // For type conversions
