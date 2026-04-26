import { mapUserResponse, mapUserToApiFormat, UserApiResponse } from './user.mapper';
import { User } from '../../domain/models/user.model';

describe('user.mapper', () => {
  const apiResponse: UserApiResponse = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2025-06-01T12:00:00.000Z',
  };

  describe('mapUserResponse', () => {
    it('should convert API response to User domain model', () => {
      const user = mapUserResponse(apiResponse);

      expect(user.id).toBe(1);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.toISOString()).toBe('2025-06-01T12:00:00.000Z');
    });
  });

  describe('mapUserToApiFormat', () => {
    it('should convert User domain model to API format with ISO string', () => {
      const user: User = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date('2025-07-15T08:30:00.000Z'),
      };

      const result = mapUserToApiFormat(user);

      expect(result.id).toBe(2);
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
      expect(typeof result.createdAt).toBe('string');
      expect(result.createdAt).toBe('2025-07-15T08:30:00.000Z');
    });
  });

  describe('round-trip', () => {
    it('should produce equivalent object after mapUserResponse then mapUserToApiFormat', () => {
      const roundTripped = mapUserToApiFormat(mapUserResponse(apiResponse));

      expect(roundTripped).toEqual(apiResponse);
    });
  });
});
