import { TokenStoreService } from './token-store.service';

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
});
