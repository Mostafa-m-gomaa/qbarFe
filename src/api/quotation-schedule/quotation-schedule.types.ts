export type LookupListKey =
  | 'amperes'
  | 'conductors'
  | 'poles'
  | 'ip'
  | 'treatments'
  | 'accessories'
  | 'tapRatings';

export interface LookupValue {
  value: string;
  sortOrder: number;
}

export interface BusbarStandardPrice {
  id: string;
  amp: number;
  conductor: string;
  itemKey: string;
  unitCode: string;
  sellAmountMinor: number;
  currencyCode: string;
  costAmountMinor?: number;
}

export interface QuotationScheduleSettings {
  vatOn: boolean;
  vatRate: string;
  installationIncluded: boolean;
  installationPercent: string;
  defaultAmp: number;
  defaultConductor: string;
  defaultPoles: string;
  defaultIp: string;
  defaultTreatment: string;
  defaultStraightItemKey: string;
  defaultStraightUnitCode: string;
  defaultValidity: string;
  defaultPricingProfile: string;
}

export interface QuotationSchedule {
  settings: QuotationScheduleSettings;
  lists: Record<LookupListKey, LookupValue[]>;
  prices: BusbarStandardPrice[];
}
