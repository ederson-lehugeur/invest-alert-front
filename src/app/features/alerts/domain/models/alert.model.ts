export type AlertStatus = 'PENDING' | 'SENT';

export interface Alert {
  readonly id: number;
  readonly ticker: string;
  readonly status: AlertStatus;
  readonly details: string;
  readonly createdAt: Date;
  readonly sentAt: Date | null;
}
