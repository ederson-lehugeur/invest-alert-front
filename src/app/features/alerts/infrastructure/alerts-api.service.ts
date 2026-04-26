import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertRepository, AlertFilter } from '../domain/interfaces/alert.repository';
import { Alert } from '../domain/models/alert.model';
import { PageResult } from '../../../shared/models/page-result.model';
import { AlertApiResponse, mapAlertResponse, mapPageResult } from './mappers/alert.mapper';

@Injectable({ providedIn: 'root' })
export class AlertsApiService implements AlertRepository {
  private readonly http = inject(HttpClient);

  list(filter: AlertFilter, page: number, size: number): Observable<PageResult<Alert>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.ticker) {
      params = params.set('ticker', filter.ticker);
    }

    if (filter.status) {
      params = params.set('status', filter.status);
    }

    return this.http
      .get<PageResult<AlertApiResponse>>('/api/alerts', { params })
      .pipe(map((response) => mapPageResult(response, mapAlertResponse)));
  }
}
