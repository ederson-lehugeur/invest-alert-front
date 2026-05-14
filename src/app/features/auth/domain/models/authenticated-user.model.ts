export interface AuthenticatedUser {
  readonly userId: number;
  readonly permissions: readonly string[];
}
