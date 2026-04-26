export interface Asset {
  readonly ticker: string;
  readonly name: string;
  readonly currentPrice: number;
  readonly dividendYield: number;
  readonly pVp: number;
  readonly updatedAt: Date;
}
