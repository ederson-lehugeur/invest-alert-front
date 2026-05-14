import * as fc from 'fast-check';
import { TokenStoreService } from './token-store.service';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('TokenStoreService', () => {
  let service: TokenStoreService;

  beforeEach(() => {
    service = new TokenStoreService();
  });

  it('should start with null token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should store and retrieve a token', () => {
    service.setToken('jwt-abc-123');
    expect(service.getToken()).toBe('jwt-abc-123');
  });

  it('should clear the token', () => {
    service.setToken('jwt-abc-123');
    service.clearToken();
    expect(service.getToken()).toBeNull();
  });

  it('should emit token values via token$', () => {
    const emissions: (string | null)[] = [];
    const sub = service.token$.subscribe((t) => emissions.push(t));

    service.setToken('token-1');
    service.setToken('token-2');
    service.clearToken();

    sub.unsubscribe();

    expect(emissions).toEqual([null, 'token-1', 'token-2', null]);
  });

  it('should emit isAuthenticated$ as false initially', () => {
    const emissions: boolean[] = [];
    const sub = service.isAuthenticated$.subscribe((v) => emissions.push(v));
    sub.unsubscribe();

    expect(emissions).toEqual([false]);
  });

  it('should emit isAuthenticated$ as true when token is set', () => {
    const emissions: boolean[] = [];
    service.setToken('jwt-abc');
    const sub = service.isAuthenticated$.subscribe((v) => emissions.push(v));
    sub.unsubscribe();

    expect(emissions).toEqual([true]);
  });

  it('should emit isAuthenticated$ transitions', () => {
    const emissions: boolean[] = [];
    const sub = service.isAuthenticated$.subscribe((v) => emissions.push(v));

    service.setToken('jwt-abc');
    service.clearToken();

    sub.unsubscribe();

    expect(emissions).toEqual([false, true, false]);
  });

  // --- RBAC: permissions extraction ---

  it('should extract permissions from a valid JWT with permissions field', () => {
    const token = makeJwt({ sub: '1', permissions: ['ALERT_CREATE', 'ALERT_UPDATE'] });
    service.setToken(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual(['ALERT_CREATE', 'ALERT_UPDATE']);
  });

  it('should store empty array when permissions field is absent', () => {
    const token = makeJwt({ sub: '1' });
    service.setToken(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should store empty array when JWT is malformed', () => {
    service.setToken('not.a.valid.jwt.at.all');

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should store empty array when JWT has only one part', () => {
    service.setToken('onlyonepart');

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should store empty array when permissions field is not an array', () => {
    const token = makeJwt({ sub: '1', permissions: 'ALERT_CREATE' });
    service.setToken(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should clear permissions when clearToken() is called', () => {
    const token = makeJwt({ sub: '1', permissions: ['ALERT_CREATE'] });
    service.setToken(token);

    service.clearToken();

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should emit permissions$ as empty array initially', () => {
    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));
    expect(emitted).toEqual([]);
  });
});

describe('TokenStoreService - Property Tests', () => {
  let service: TokenStoreService;

  beforeEach(() => {
    service = new TokenStoreService();
  });

  // Feature: invest-alert-front-rbac, Property 1: Extração de permissions do JWT
  it('should extract permissions from any valid JWT payload', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        (permissions) => {
          const freshService = new TokenStoreService();
          const payload = btoa(JSON.stringify({ sub: '1', permissions }));
          const token = `header.${payload}.signature`;

          freshService.setToken(token);

          let emitted: readonly string[] | undefined;
          freshService.permissions$.subscribe((p) => (emitted = p));

          expect(emitted).toEqual(permissions);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: invest-alert-front-rbac, Property 2: Logout limpa as permissions
  it('should clear permissions on clearToken regardless of what was stored', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        (permissions) => {
          const freshService = new TokenStoreService();
          const payload = btoa(JSON.stringify({ sub: '1', permissions }));
          const token = `header.${payload}.signature`;

          freshService.setToken(token);
          freshService.clearToken();

          let emitted: readonly string[] | undefined;
          freshService.permissions$.subscribe((p) => (emitted = p));

          expect(emitted).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
