import { User } from '../../domain/models/user.model';

export interface UserApiResponse {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly createdAt: string;
}

export function mapUserResponse(response: UserApiResponse): User {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    createdAt: new Date(response.createdAt),
  };
}

export function mapUserToApiFormat(user: User): UserApiResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}
