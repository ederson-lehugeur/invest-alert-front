import * as fc from 'fast-check';
import { TokenStoreService } from './token-store.service';
import { Token } from '../domain/models/token.model';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function makeToken(overrides: Partial<Token> = {}): Token {
  return {
    accessToken: makeJwt({ sub: '1', permissions: [] }),
    refreshToken: 'refresh-token-abc',
    accessTokenExpiresIn: 900,
    refreshTokenExpiresIn: 604800,
    ...overrides,
  };
}

describe('TokenStoreService', () => {
  let service: TokenStoreService;

  beforeEach(() => {
    localStorage.clear();
    service = new TokenStoreService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with null token when localStorage is empty', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should start with null refresh token when localStorage is empty', () => {
    expect(service.getRefreshToken()).toBeNull();
  });

  it('should hydrate access token from localStorage on instantiation', () => {
    const token = makeToken();
    localStorage.setItem('auth.accessToken', token.accessToken);
    localStorage.setItem('auth.refreshToken', token.refreshToken);
    localStorage.setItem('auth.accessTokenExpiresAt', String(Date.now() + 900_000));

    const hydratedService = new TokenStoreService();

    expect(hydratedService.getToken()).toBe(token.accessToken);
    expect(hydratedService.getRefreshToken()).toBe(token.refreshToken);
  });

  it('should emit isAuthenticated$ as true when token exists in localStorage on instantiation', () => {
    const token = makeToken();
    localStorage.setItem('auth.accessToken', token.accessToken);

    const hydratedService = new TokenStoreService();
    const emissions: boolean[] = [];
    const sub = hydratedService.isAuthenticated$.subscribe((v) => emissions.push(v));
    sub.unsubscribe();

    expect(emissions).toEqual([true]);
  });

  it('should store access and refresh tokens via setTokens', () => {
    const token = makeToken({ accessToken: makeJwt({ sub: '1', permissions: [] }), refreshToken: 'rt-xyz' });
    service.setTokens(token);
    expect(service.getToken()).toBe(token.accessToken);
    expect(service.getRefreshToken()).toBe('rt-xyz');
  });

  it('should clear both tokens on clearTokens', () => {
    service.setTokens(makeToken());
    service.clearTokens();
    expect(service.getToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('should emit token values via token$', () => {
    const token1 = makeToken({ accessToken: makeJwt({ sub: '1', permissions: [] }) });
    const token2 = makeToken({ accessToken: makeJwt({ sub: '2', permissions: [] }) });
    const emissions: (string | null)[] = [];
    const sub = service.token$.subscribe((t) => emissions.push(t));

    service.setTokens(token1);
    service.setTokens(token2);
    service.clearTokens();

    sub.unsubscribe();

    expect(emissions).toEqual([null, token1.accessToken, token2.accessToken, null]);
  });

  it('should emit isAuthenticated$ as false initially', () => {
    const emissions: boolean[] = [];
    const sub = service.isAuthenticated$.subscribe((v) => emissions.push(v));
    sub.unsubscribe();

    expect(emissions).toEqual([false]);
  });

  it('should emit isAuthenticated$ as true when tokens are set', () => {
    const emissions: boolean[] = [];
    service.setTokens(makeToken());
    const sub = service.isAuthenticated$.subscribe((v) => emissions.push(v));
    sub.unsubscribe();

    expect(emissions).toEqual([true]);
  });

  it('should emit isAuthenticated$ transitions', () => {
    const emissions: boolean[] = [];
    const sub = service.isAuthenticated$.subscribe((v) => emissions.push(v));

    service.setTokens(makeToken());
    service.clearTokens();

    sub.unsubscribe();

    expect(emissions).toEqual([false, true, false]);
  });

  // --- Token expiry ---

  it('should report access token as not expired immediately after setTokens', () => {
    service.setTokens(makeToken({ accessTokenExpiresIn: 900 }));
    expect(service.isAccessTokenExpired()).toBe(false);
  });

  it('should report access token as expired when expiresIn is 0', () => {
    service.setTokens(makeToken({ accessTokenExpiresIn: 0 }));
    expect(service.isAccessTokenExpired()).toBe(true);
  });

  it('should report access token as expired when no tokens are set', () => {
    expect(service.isAccessTokenExpired()).toBe(true);
  });

  it('should report access token as expired after clearTokens', () => {
    service.setTokens(makeToken({ accessTokenExpiresIn: 900 }));
    service.clearTokens();
    expect(service.isAccessTokenExpired()).toBe(true);
  });

  // --- RBAC: permissions extraction ---

  it('should extract permissions from a valid JWT with permissions field', () => {
    const token = makeToken({
      accessToken: makeJwt({ sub: '1', permissions: ['ALERT_CREATE', 'ALERT_UPDATE'] }),
    });
    service.setTokens(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual(['ALERT_CREATE', 'ALERT_UPDATE']);
  });

  it('should store empty array when permissions field is absent', () => {
    const token = makeToken({ accessToken: makeJwt({ sub: '1' }) });
    service.setTokens(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should store empty array when JWT is malformed', () => {
    const token = makeToken({ accessToken: 'not.a.valid.jwt.at.all' });
    service.setTokens(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should store empty array when JWT has only one part', () => {
    const token = makeToken({ accessToken: 'onlyonepart' });
    service.setTokens(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should store empty array when permissions field is not an array', () => {
    const token = makeToken({ accessToken: makeJwt({ sub: '1', permissions: 'ALERT_CREATE' }) });
    service.setTokens(token);

    let emitted: readonly string[] | undefined;
    service.permissions$.subscribe((p) => (emitted = p));

    expect(emitted).toEqual([]);
  });

  it('should clear permissions when clearTokens() is called', () => {
    const token = makeToken({ accessToken: makeJwt({ sub: '1', permissions: ['ALERT_CREATE'] }) });
    service.setTokens(token);

    service.clearTokens();

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
    localStorage.clear();
    service = new TokenStoreService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Feature: invest-alert-front-rbac, Property 1: Extração de permissions do JWT
  it('should extract permissions from any valid JWT payload', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        (permissions) => {
          localStorage.clear();
          const freshService = new TokenStoreService();
          const payload = btoa(JSON.stringify({ sub: '1', permissions }));
          const accessToken = `header.${payload}.signature`;

          freshService.setTokens({
            accessToken,
            refreshToken: 'rt',
            accessTokenExpiresIn: 900,
            refreshTokenExpiresIn: 604800,
          });

          let emitted: readonly string[] | undefined;
          freshService.permissions$.subscribe((p) => (emitted = p));

          expect(emitted).toEqual(permissions);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: invest-alert-front-rbac, Property 2: Logout limpa as permissions
  it('should clear permissions on clearTokens regardless of what was stored', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        (permissions) => {
          localStorage.clear();
          const freshService = new TokenStoreService();
          const payload = btoa(JSON.stringify({ sub: '1', permissions }));
          const accessToken = `header.${payload}.signature`;

          freshService.setTokens({
            accessToken,
            refreshToken: 'rt',
            accessTokenExpiresIn: 900,
            refreshTokenExpiresIn: 604800,
          });
          freshService.clearTokens();

          let emitted: readonly string[] | undefined;
          freshService.permissions$.subscribe((p) => (emitted = p));

          expect(emitted).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
