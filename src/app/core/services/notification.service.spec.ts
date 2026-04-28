import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
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

  describe('showSuccess', () => {
    it('should open snackbar with 3000ms duration and no action', () => {
      service.showSuccess('Item created');

      expect(snackBarSpy.open).toHaveBeenCalledWith('Item created', undefined, {
        duration: 3000,
      });
    });

    it('should pass the message through unchanged', () => {
      service.showSuccess('Rule updated successfully');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Rule updated successfully',
        undefined,
        expect.objectContaining({ duration: 3000 }),
      );
    });
  });

  describe('showError', () => {
    it('should open snackbar with 5000ms duration and Dismiss action', () => {
      service.showError('Something went wrong');

      expect(snackBarSpy.open).toHaveBeenCalledWith('Something went wrong', 'Dismiss', {
        duration: 5000,
      });
    });

    it('should pass the error message through unchanged', () => {
      service.showError('Network error occurred');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Network error occurred',
        'Dismiss',
        expect.objectContaining({ duration: 5000 }),
      );
    });
  });
});
