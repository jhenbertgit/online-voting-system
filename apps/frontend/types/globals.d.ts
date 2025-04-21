export {};

// Create a type for the roles
export type Roles = "admin" | "election_officer" | "voter";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
