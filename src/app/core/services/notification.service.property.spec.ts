// Feature: material-dashboard-redesign, Property 5: Notification service configuration correctness
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fc from 'fast-check';
import { NotificationService } from './notification.service';

/**
 * **Validates: Requirements 11.2, 11.3**
 *
 * Property 5: Notification service configuration correctness
 * For any non-empty message string and notification type (success or error),
 * calling the corresponding NotificationService method should open MatSnackBar
 * with the correct duration (3000ms for success, 5000ms for error) and action
 * (undefined for success, 'Dismiss' for error).
 */
describe('NotificationService - Property Tests', () => {
  let service: NotificationService;
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should open snackbar with correct duration and action for any message and type', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.constantFrom<'success' | 'error'>('success', 'error'),
        (message, type) => {
          snackBarSpy.open.mockClear();

          if (type === 'success') {
            service.showSuccess(message);
          } else {
            service.showError(message);
          }

          expect(snackBarSpy.open).toHaveBeenCalledOnce();

          const [calledMessage, calledAction, calledConfig] = snackBarSpy.open.mock.calls[0];

          expect(calledMessage).toBe(message);

          if (type === 'success') {
            expect(calledAction).toBeUndefined();
            expect(calledConfig).toEqual({ duration: 3000 });
          } else {
            expect(calledAction).toBe('Dismiss');
            expect(calledConfig).toEqual({ duration: 5000 });
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
