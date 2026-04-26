import { Alert, AlertStatus } from '../../domain/models/alert.model';
import { mapPageResult } from '../../../assets/infrastructure/mappers/asset.mapper';

export { mapPageResult };

export interface AlertApiResponse {
  readonly id: number;
  readonly ticker: string;
  readonly status: AlertStatus;
  readonly details: string;
  readonly createdAt: string;
  readonly sentAt: string | null;
}

export function mapAlertResponse(response: AlertApiResponse): Alert {
  return {
    id: response.id,
    ticker: response.ticker,
    status: response.status,
    details: response.details,
    createdAt: new Date(response.createdAt),
    sentAt: response.sentAt ? new Date(response.sentAt) : null,
  };
}

export function mapAlertToApiFormat(alert: Alert): AlertApiResponse {
  return {
    id: alert.id,
    ticker: alert.ticker,
    status: alert.status,
    details: alert.details,
    createdAt: alert.createdAt.toISOString(),
    sentAt: alert.sentAt ? alert.sentAt.toISOString() : null,
  };
}
