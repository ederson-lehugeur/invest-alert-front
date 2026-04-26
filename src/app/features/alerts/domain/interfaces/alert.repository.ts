import { Observable } from 'rxjs';
import { Alert, AlertStatus } from '../models/alert.model';
import { PageResult } from '../../../../shared/models/page-result.model';

export interface AlertFilter {
  readonly ticker?: string;
  readonly status?: AlertStatus;
}

export interface AlertRepository {
  list(filter: AlertFilter, page: number, size: number): Observable<PageResult<Alert>>;
}
