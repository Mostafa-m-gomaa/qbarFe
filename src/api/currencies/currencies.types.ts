export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  /** Per-currency decimal places (0–4). The only source for money formatting. */
  minorUnits: number;
  isActive: boolean;
  isBase?: boolean;
}

export interface ListCurrenciesParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}
